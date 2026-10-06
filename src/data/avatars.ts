import { ImageSourcePropType } from "react-native";

export type ProfileGender = "girl" | "boy";

export type AvatarId = "girl-1" | "girl-2" | "boy-1" | "boy-2";

export type AvatarOption = {
  id: AvatarId;
  source: ImageSourcePropType;
};

const GIRL_AVATARS: AvatarOption[] = [
  { id: "girl-1", source: require("../assets/girl-avatar-1.png") },
  { id: "girl-2", source: require("../assets/girl-avatar-2.png") },
];

const BOY_AVATARS: AvatarOption[] = [
  { id: "boy-1", source: require("../assets/boy-avatar-1.png") },
  { id: "boy-2", source: require("../assets/boy-avatar-2.png") },
];

export function getAvatarsForGender(gender: ProfileGender): AvatarOption[] {
  return gender === "girl" ? GIRL_AVATARS : BOY_AVATARS;
}

export function isAvatarId(value: unknown): value is AvatarId {
  return (
    value === "girl-1" ||
    value === "girl-2" ||
    value === "boy-1" ||
    value === "boy-2"
  );
}

export function isProfileGender(value: unknown): value is ProfileGender {
  return value === "girl" || value === "boy";
}

/** Resolve profile picture; falls back to default Mini Abdullah art for legacy accounts. */
export function getAvatarSource(
  avatarId?: string | null,
  gender?: string | null,
): ImageSourcePropType {
  if (isAvatarId(avatarId)) {
    const list =
      avatarId.startsWith("girl")
        ? GIRL_AVATARS
        : avatarId.startsWith("boy")
          ? BOY_AVATARS
          : [];
    const found = list.find((a) => a.id === avatarId);
    if (found) return found.source;
  }

  if (isProfileGender(gender)) {
    return getAvatarsForGender(gender)[0].source;
  }

  return require("../assets/miniAbdullah.png");
}

export function defaultAvatarIdForGender(gender: ProfileGender): AvatarId {
  return getAvatarsForGender(gender)[0].id;
}
