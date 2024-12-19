type SpaceParamKey = 'position' | 'rotation' | 'scale';

export const parseSpaceParamStr = (spaceParam?: string) => {
  const spaceParamObj: Record<SpaceParamKey, { x: number; y: number; z: number }> = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
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
    } catch (e) {}
  }
  return {
    position: { ...spaceParamObj.position },
    rotation: { ...spaceParamObj.rotation },
    scale: { ...spaceParamObj.scale },
  };
};
