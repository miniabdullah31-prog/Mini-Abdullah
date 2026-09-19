import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  type ImageProps,
  type ImageSourcePropType,
  type ImageStyle,
  StyleProp,
} from "react-native";

type Props = Omit<ImageProps, "source"> & {
  remoteUri?: string | null;
  localSource?: ImageSourcePropType | null;
  /** Use bundled asset immediately (API failed). Happy path waits for the remote thumb. */
  preferLocal?: boolean;
  style?: StyleProp<ImageStyle>;
};

/**
 * Prefer a remote URL, fall back to the bundled asset if it fails or is missing.
 * Do not decode the large local PNG while a remote thumb is loading.
 */
const RemoteImage: React.FC<Props> = ({
  remoteUri,
  localSource,
  preferLocal = false,
  onError,
  onLoad,
  style,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    setFailed(false);
    const willRemote = Boolean(remoteUri);
    setLoading(willRemote);
    startedAt.current = willRemote ? Date.now() : 0;
  }, [remoteUri]);

  const useRemote = Boolean(remoteUri) && !failed;
  const useLocal = !useRemote && Boolean(localSource) && (preferLocal || failed);

  const source: ImageSourcePropType | undefined = useRemote && remoteUri
    ? { uri: remoteUri, cache: "force-cache" }
    : useLocal
      ? localSource || undefined
      : undefined;

  if (!source) {
    if (remoteUri && loading) {
      return (
        <View style={style}>
          <View style={styles.spinner} pointerEvents="none">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={style}>
      <Image
        {...rest}
        style={StyleSheet.absoluteFill}
        source={source}
        onLoadEnd={() => setLoading(false)}
        onLoad={(event) => {
          if (__DEV__ && useRemote && startedAt.current) {
            console.log(
              "[stories-perf] image",
              Date.now() - startedAt.current + "ms",
              remoteUri,
            );
          }
          onLoad?.(event);
        }}
        onError={(event) => {
          if (__DEV__) {
            console.log("[stories-perf] image-error fallback-local", remoteUri);
          }
          if (useRemote && localSource) {
            setFailed(true);
            setLoading(false);
          }
          onError?.(event);
        }}
      />
      {useRemote && loading ? (
        <View style={styles.spinner} pointerEvents="none">
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  spinner: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(RemoteImage);
