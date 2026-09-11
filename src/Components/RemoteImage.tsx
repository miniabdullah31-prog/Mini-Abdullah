import React, { useEffect, useState } from "react";
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
  style?: StyleProp<ImageStyle>;
};

/**
 * Prefer a remote URL, fall back to the bundled asset if it fails or is missing.
 * Local `defaultSource` shows immediately while the remote file loads.
 */
const RemoteImage: React.FC<Props> = ({
  remoteUri,
  localSource,
  onError,
  style,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoading(Boolean(remoteUri));
  }, [remoteUri]);

  const useRemote = Boolean(remoteUri) && !failed;
  const source: ImageSourcePropType | undefined =
    useRemote && remoteUri
      ? { uri: remoteUri }
      : localSource || undefined;

  if (!source) {
    return null;
  }

  return (
    <View style={style}>
      <Image
        {...rest}
        style={StyleSheet.absoluteFillObject}
        source={source}
        defaultSource={
          useRemote && localSource ? localSource : undefined
        }
        onLoadEnd={() => setLoading(false)}
        onError={(event) => {
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
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RemoteImage;
