import { prisma } from '../../config/prisma.js';
import type { Balance, Prisma } from '../../../generated/prisma/index.js';
import type { CreateBalanceDto } from '@almacen/shared';

export class BalanceResponsibleEmployeeError extends Error {
  constructor() {
    super('No se puede identificar al empleado responsable. La cuenta debe tener un empleado asociado.');
    this.name = 'BalanceResponsibleEmployeeError';
  }
}

export type BalanceCreationRepository = {
  employee: {
    findUnique(args: {
      where: { userId: number };
      select: { id: true };
    }): Promise<{ id: number } | null>;
  };
  balance: {
    create(args: { data: Prisma.BalanceCreateInput }): Promise<Balance>;
  };
};

export async function resolveResponsibleEmployee(
  userId: number,
  employeeRepository: BalanceCreationRepository['employee'],
): Promise<number> {
  const employee = await employeeRepository.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!employee) throw new BalanceResponsibleEmployeeError();
  return employee.id;
}

const balanceHistoryQuery = {
  orderBy: [{ date: 'desc' }, { id: 'desc' }],
  include: {
    employee: {
      select: {
        firstname: true,
        lastname: true,
        fullname: true,
        user: { select: { email: true } },
      },
    },
  },
} satisfies Prisma.BalanceFindManyArgs;

type BalanceHistoryRepository = {
  findMany(args: typeof balanceHistoryQuery): Promise<Prisma.BalanceGetPayload<{
    include: typeof balanceHistoryQuery.include;
  }>[]>;
};

const getBalancesFromDatabase = async (repository: BalanceHistoryRepository = prisma.balance) =>
  repository.findMany(balanceHistoryQuery);

const getBalanceByIdFromDatabase = async (balanceId: number) => prisma.balance.findUnique({ where: { id: balanceId } });

const postBalanceToDatabase = async (
  balanceData: CreateBalanceDto,
  repository: BalanceCreationRepository = prisma,
) => {
  const employeeId = await resolveResponsibleEmployee(balanceData.userId, repository.employee);
  return repository.balance.create({
    data: {
      date: balanceData.date,
      opening: balanceData.opening,
      cashIn: balanceData.cashIn,
      cashOut: balanceData.cashOut,
      expectedClosing: balanceData.expectedClosing,
      actualClosing: balanceData.actualClosing,
      difference: balanceData.difference,
      movementType: balanceData.movementType,
      employee: { connect: { id: employeeId } },
    },
  });
};

const updateBalanceFromDatabase = async (balanceId: number, balanceData: Prisma.BalanceUpdateInput) =>
  prisma.balance.update({ where: { id: balanceId }, data: balanceData });

const deleteBalanceFromDatabase = async (balanceId: number) => prisma.balance.delete({ where: { id: balanceId } });

export {
  getBalancesFromDatabase,
  getBalanceByIdFromDatabase,
  postBalanceToDatabase,
  updateBalanceFromDatabase,
  deleteBalanceFromDatabase,
};
