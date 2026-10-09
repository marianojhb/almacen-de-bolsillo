import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import {
  EmployeeCard,
  EmployeeFilters,
  NewEmployeeButton,
  type EmployeeFilter,
} from "@/components/employees";
import { formatEmployeeCode } from "@/components/employees/employee.utils";
import { useEmployees } from "@/contexts/employees";

export default function EmployeesScreen() {
  const { employees, isLoadingEmployees, employeesError, refreshEmployees } = useEmployees();

  useFocusEffect(useCallback(() => { void refreshEmployees(); }, [refreshEmployees]));

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refreshEmployees(); } finally { setIsRefreshing(false); }
  };

  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilter>("active");

  const [expandedEmployeeIds, setExpandedEmployeeIds] = useState<Set<number>>(() => new Set());

  const visibleEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesStatus = employeeFilter === "all" ||
        (employeeFilter === "active" && employee.isActive) ||
        (employeeFilter === "inactive" && !employee.isActive);

      const matchesSearch = !normalizedSearch ||
        [
          formatEmployeeCode(employee.commerceEmployeeId),
          employee.fullname,
          employee.firstname,
          employee.lastname,
          employee.dni,
          employee.cuil,
          employee.jobTitle,
          employee.account?.username,
        ].some((value) =>
          value?.toLowerCase().includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [employeeFilter, employees, search]);

  const toggleEmployee = (employeeId: number) => {
    setExpandedEmployeeIds((current) => {
      const next = new Set(current);

      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }

      return next;
    });
  };

  const removeExpandedEmployee = (employeeId: number) => {
    setExpandedEmployeeIds((current) => {
      const next = new Set(current);
      next.delete(employeeId);
      return next;
    });
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4 dark:bg-black">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-gray-950 dark:text-white">
            Empleados
          </Text>

          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {visibleEmployees.length} visibles
          </Text>
        </View>
        <NewEmployeeButton/>
      </View>
      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        filter={employeeFilter}
        onFilterChange={setEmployeeFilter}
      />
      {employeesError && (
        <View className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950">
          <Text className="text-red-700 dark:text-red-300">
            {employeesError}
          </Text>
        </View>
      )}
      <FlatList
        data={visibleEmployees}
        extraData={expandedEmployeeIds}
        keyExtractor={(employee) => employee.id.toString()}
        contentContainerClassName="gap-3 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
          />
        }
        ListEmptyComponent={
          isLoadingEmployees ? (
            <Text className="text-center text-gray-500 dark:text-gray-400">
              Cargando empleados...
            </Text>
          ) : (
            <View className="items-center py-16">
              <Ionicons
                name="people-outline"
                size={48}
                color="#9ca3af"
              />
              <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
                No se encontraron empleados
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <EmployeeCard
            employee={item}
            isExpanded={expandedEmployeeIds.has(item.id)}
            onToggle={() => toggleEmployee(item.id)}
            onDeleted={() => removeExpandedEmployee(item.id)}
          />
        )}
      />
    </View>
  );
}
