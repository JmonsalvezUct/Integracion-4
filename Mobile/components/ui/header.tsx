// components/Header.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface HeaderProps {
  title: string;
  onProfilePress?: () => void;
  containerStyle?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({ title, onProfilePress, containerStyle }) => {
  return (
    <View style={[styles.header, containerStyle]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7}>
        <View style={styles.profileCircle} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff33",
  },
});

export default Header;
