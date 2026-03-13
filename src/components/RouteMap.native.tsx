import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { useI18n } from "../i18n";
import { Coordinate } from "../types/run";
import { palette, radius, spacing } from "../utils/constants";
import { boundingRegion } from "../utils/geo";

interface RouteMapProps {
  route: Coordinate[];
}

export function RouteMap({ route }: RouteMapProps) {
  const { t } = useI18n();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (route.length < 2 || !mapRef.current) {
      return;
    }

    mapRef.current.fitToCoordinates(route, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
  }, [route]);

  if (route.length === 0) {
    return (
      <View style={[styles.placeholder, styles.shell]}>
        <Text style={styles.placeholderTitle}>{t("map.noRoute")}</Text>
        <Text style={styles.placeholderBody}>{t("map.completeRunFirst")}</Text>
      </View>
    );
  }

  const region = boundingRegion(route);
  if (!region) {
    return null;
  }

  return (
    <View style={styles.shell}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} showsCompass={false}>
        <Polyline coordinates={route} strokeColor={palette.accent} strokeWidth={5} />
        <Marker coordinate={route[0]} pinColor={palette.accentWarm} />
        <Marker coordinate={route[route.length - 1]} pinColor={palette.accent} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cardMuted,
  },
  map: {
    width: "100%",
    height: 260,
  },
  placeholder: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  placeholderTitle: {
    color: palette.text,
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  placeholderBody: {
    color: palette.textMuted,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_400Regular",
  },
});
