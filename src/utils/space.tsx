type SpaceParamKey = 'position' | 'rotation' | 'scale';

export const parseSpaceParamStr = (spaceParam?: string) => {
  const spaceParamObj: Record<SpaceParamKey, { x: number; y: number; z: number }> = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
  
  let userImage: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  } | undefined = undefined;
  
  if (typeof spaceParam === 'string' && spaceParam) {
    try {
      const spaceParamJson = JSON.parse(spaceParam);
      (['position', 'rotation'] as SpaceParamKey[]).forEach((key) => {
        spaceParamObj[key].x = spaceParamJson?.[key]?.x || 0;
        spaceParamObj[key].y = spaceParamJson?.[key]?.y || 0;
        spaceParamObj[key].z = spaceParamJson?.[key]?.z || 0;
      });

      (['scale'] as SpaceParamKey[]).forEach((key) => {
        spaceParamObj[key].x = spaceParamJson?.[key]?.x || 1;
        spaceParamObj[key].y = spaceParamJson?.[key]?.y || 1;
        spaceParamObj[key].z = spaceParamJson?.[key]?.z || 1;
      });
      
      // Parse userImage if it exists
      if (spaceParamJson?.userImage) {
        userImage = {};
        if (spaceParamJson.userImage.position) {
          userImage.position = {
            x: spaceParamJson.userImage.position.x || 0,
            y: spaceParamJson.userImage.position.y || 0,
            z: spaceParamJson.userImage.position.z || 0,
          };
        }
        if (spaceParamJson.userImage.rotation) {
          userImage.rotation = {
            x: spaceParamJson.userImage.rotation.x || 0,
            y: spaceParamJson.userImage.rotation.y || 0,
            z: spaceParamJson.userImage.rotation.z || 0,
          };
        }
        if (spaceParamJson.userImage.scale) {
          userImage.scale = {
            x: spaceParamJson.userImage.scale.x || 1,
            y: spaceParamJson.userImage.scale.y || 1,
            z: spaceParamJson.userImage.scale.z || 1,
          };
        }
      }
    } catch (e) {}
  }
  
  const result = {
    position: { ...spaceParamObj.position },
    rotation: { ...spaceParamObj.rotation },
    scale: { ...spaceParamObj.scale },
  } as any;
  
  if (userImage) {
    result.userImage = userImage;
  }
  
  return result;
};
