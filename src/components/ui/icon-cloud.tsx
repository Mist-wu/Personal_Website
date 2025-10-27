"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Cloud,
  ICloud,
  renderSimpleIcon,
  SimpleIcon,
} from "react-icon-cloud";
import type { SimpleIcon as SimpleIconType } from 'simple-icons'
import * as simpleIcons from 'simple-icons'

// Theme color constants
const THEME_COLORS = {
  light: {
    bg: "#f3f2ef",
    fallback: "#6e6e73"
  },
  dark: {
    bg: "#080510",
    fallback: "#ffffff"
  }
} as const;

export const cloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "default",
    tooltip: "native",
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#0000",
    maxSpeed: 0.04,
    minSpeed: 0.02,
    // dragControl: false,
  },
};

export const renderCustomIcon = (icon: SimpleIcon, theme: string) => {
  const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.light;
  const bgHex = colors.bg;
  const fallbackHex = colors.fallback;
  const minContrastRatio = 1;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: any) => e.preventDefault(),
    },
  });
};

export type DynamicCloudProps = {
  iconSlugs: {
    slug: string
    title: string
  }[];
};

const getIcon = (slug: string): SimpleIconType => {
  const iconName = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`
  return (simpleIcons as any)[iconName]
}

export default function IconCloud({ iconSlugs }: DynamicCloudProps) {
  const { theme } = useTheme();
  const [initialTheme, setInitialTheme] = useState<string | null>(null);
  const cloudContainerRef = useRef<HTMLDivElement>(null);

  // Capture the initial theme on mount (only once)
  useEffect(() => {
    if (initialTheme === null && theme) {
      setInitialTheme(theme);
    }
  }, [theme, initialTheme]);

  const data: SimpleIconType[] = useMemo(() => {
    return iconSlugs.map((icon) => {
      const simpleIcon = getIcon(icon.slug)
      if (!simpleIcon) {
        // Fallback or logging
        console.warn(`Icon not found for slug: ${icon.slug}`)
        return null
      }
      return {
        ...simpleIcon,
        path: simpleIcon.path,
      }
    }).filter(Boolean) as SimpleIconType[]
  }, [iconSlugs])

  // Render icons only once on mount with initial theme, don't re-render when theme changes
  const renderedIcons = useMemo(() => {
    if (!data || initialTheme === null) return null;

    return data.map((icon) =>
      renderCustomIcon(icon, initialTheme),
    );
  }, [data, initialTheme]);

  // Update icon colors when theme changes without re-rendering Cloud
  useEffect(() => {
    if (!cloudContainerRef.current || !theme || initialTheme === null) return;
    
    const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.light;
    
    // Update SVG background and fallback colors
    const svgs = cloudContainerRef.current.querySelectorAll('svg');
    svgs.forEach((svg) => {
      // Update background rectangles
      const rect = svg.querySelector('rect');
      if (rect) {
        rect.setAttribute('fill', colors.bg);
      }
      
      // Update path colors if they use the fallback color
      const paths = svg.querySelectorAll('path');
      paths.forEach((path) => {
        const currentFill = path.getAttribute('fill');
        // Only update if it looks like a fallback color (light or dark theme fallback)
        if (currentFill && (
          currentFill === THEME_COLORS.light.fallback || 
          currentFill === THEME_COLORS.dark.fallback
        )) {
          path.setAttribute('fill', colors.fallback);
        }
      });
    });
  }, [theme, initialTheme]);

  return (
    <div ref={cloudContainerRef}>
      {/* @ts-ignore */}
      <Cloud {...cloudProps}>
        <>{renderedIcons}</>
      </Cloud>
    </div>
  );
}
