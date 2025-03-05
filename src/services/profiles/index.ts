import { nanoid } from "nanoid";

import { removeUpload, upload } from "@/utils/upload";
import { Prisma } from "@prisma/client";

export interface ProfileServicesUpdateData {
  name?: string;
  biography?: string;
  avatar?: File;
  cover?: File;
}

export class ProfileServices {
  static async createNewData(
    profile: { id: string; avatar: string; cover: string },
    data: ProfileServicesUpdateData
  ) {
    const newData: Prisma.ProfileUpdateInput = {};
    if (data.name) {
      newData.name = data.name;
      newData.identifier = data.name.toLowerCase().trim();
    }
    if (data.biography) newData.biography = data.biography;
    if (data.avatar) {
      const fileName = `avatar-${profile.id}-${nanoid()}.png`;
      await upload(fileName, data.avatar);
      const currentAvatarFile = profile.avatar;
      if (!currentAvatarFile.startsWith("default"))
        await removeUpload(currentAvatarFile);
    }
    if (data.cover) {
      const fileName = `cover-${profile.id}-${nanoid()}.png`;
      await upload(fileName, data.cover);
      const currentCoverFile = profile.cover;
      if (!currentCoverFile.startsWith("default"))
        await removeUpload(currentCoverFile);
    }
    return newData;
  }
}
