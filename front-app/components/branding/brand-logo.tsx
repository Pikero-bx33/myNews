import { Image } from 'expo-image';

type BrandLogoProps = {
  width: number;
};

export function BrandLogo({ width }: BrandLogoProps) {
  return (
    <Image
      accessible={false}
      contentFit="contain"
      source={require('@/assets/branding/mynews-logo.png')}
      style={{ aspectRatio: 3, width }}
    />
  );
}
