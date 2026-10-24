import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import logoImage from "@/assets/images/almacen-de-bolsillo-magick.png";
import { OptimizedImage } from "@/components/ui/optimized-image";

let transitionHasPlayed = false;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

type Destination = {
  translateX: number;
  translateY: number;
  scale: number;
};

type StartupLogoProps = {
  targetRadius: number;
  targetSize: number;
};

export function StartupLogo({ targetRadius, targetSize }: StartupLogoProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const targetRef = useRef<View>(null);
  const animationStarted = useRef(false);
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [complete, setComplete] = useState(transitionHasPlayed);

  const initialSize = Math.min(200, screenWidth * 0.5);
  const initialLeft = (screenWidth - initialSize) / 2;
  const initialTop = (screenHeight - initialSize) / 2 - 30;

  const finish = useCallback(() => {
    transitionHasPlayed = true;
    setComplete(true);
  }, []);

  const captureDestination = useCallback(() => {
    if (reduceMotion) {
      finish();
      return;
    }

    targetRef.current?.measureInWindow((x, y) => {
      const scaleOffset = (initialSize - targetSize) / 2;
      const nextDestination = {
        translateX: x - initialLeft - scaleOffset,
        translateY: y - initialTop - scaleOffset,
        scale: targetSize / initialSize,
      };

      setDestination((current) => {
        if (
          current?.translateX === nextDestination.translateX &&
          current.translateY === nextDestination.translateY &&
          current.scale === nextDestination.scale
        ) {
          return current;
        }

        return nextDestination;
      });
    });
  }, [finish, initialLeft, initialSize, initialTop, reduceMotion, targetSize]);

  useEffect(() => {
    if (complete || !destination || animationStarted.current) return;
    animationStarted.current = true;

    progress.set(withSequence(
      withDelay(1000, withTiming(1, { duration: 180, easing: EASE_OUT })),
      withDelay(500, withTiming(2, { duration: 280, easing: EASE_IN_OUT })),
      withTiming(3, { duration: 180, easing: EASE_OUT }, (finished) => {
        "worklet";
        if (finished) scheduleOnRN(finish);
      }),
    ));

    return () => cancelAnimation(progress);
  }, [complete, destination, finish, progress]);

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 1], [1, 0], Extrapolation.CLAMP),
  }));
  const logoAnimatedStyle = useAnimatedStyle(() => {
    const currentProgress = progress.get();

    return {
      transform: [
        {
          translateX: interpolate(
            currentProgress,
            [1, 2],
            [0, destination?.translateX ?? 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            currentProgress,
            [1, 2],
            [0, destination?.translateY ?? 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            currentProgress,
            [1, 2],
            [1, destination?.scale ?? 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [2, 3], [1, 0], Extrapolation.CLAMP),
  }));

  const initialRadius = targetRadius * (initialSize / targetSize);

  return (
    <>
      <View
        ref={targetRef}
        onLayout={captureDestination}
        style={[styles.target, { width: targetSize, height: targetSize, borderRadius: targetRadius }]}
      >
        {complete && (
          <OptimizedImage
            accessibilityLabel="Logo de Almacén de Bolsillo"
            cachePolicy="memory-disk"
            contentFit="cover"
            priority="high"
            source={logoImage}
            style={styles.targetImage}
          />
        )}
      </View>

      {!complete && (
        <Modal animationType="none" onRequestClose={finish} statusBarTranslucent transparent visible>
          <View style={styles.overlay}>
            <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
            <Animated.View
              style={[
                styles.floatingLogo,
                {
                  width: initialSize,
                  height: initialSize,
                  left: initialLeft,
                  top: initialTop,
                  borderRadius: initialRadius,
                },
                logoAnimatedStyle,
              ]}
            >
              <OptimizedImage
                cachePolicy="memory-disk"
                contentFit="cover"
                priority="high"
                source={logoImage}
                style={styles.floatingLogoImage}
              />
            </Animated.View>
            <Animated.Text style={[styles.label, { top: initialTop + initialSize + 18 }, labelAnimatedStyle]}>
              Almacén de Bolsillo
            </Animated.Text>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  target: { alignItems: "center", justifyContent: "center", overflow: "hidden", borderCurve: "continuous" },
  targetImage: { width: "100%", height: "100%" },
  overlay: { position: "absolute", inset: 0, pointerEvents: "none" },
  backdrop: { position: "absolute", inset: 0, backgroundColor: "#FFFFFF" },
  floatingLogo: { position: "absolute", overflow: "hidden", borderCurve: "continuous" },
  floatingLogoImage: { width: "100%", height: "100%" },
  label: {
    position: "absolute",
    left: 0,
    right: 0,
    color: "#090E18",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.8,
  },
});
