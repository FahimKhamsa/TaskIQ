"use client";

import { cn } from "@/lib/utils";

type ColorTheme =
  | "green"
  | "purple"
  | "blue"
  | "red"
  | "orange"
  | "pink"
  | "teal"
  | "indigo";

interface ColorPickerProps {
  selectedColor: ColorTheme;
  onColorSelect: (color: ColorTheme) => void;
}

const colorOptions: Array<{
  name: ColorTheme;
  label: string;
  lightColor: string;
  darkColor: string;
  description: string;
}> = [
  {
    name: "green",
    label: "Green",
    lightColor: "hsl(106, 76%, 43%)",
    darkColor: "hsl(106, 76%, 53%)",
    description: "Default light theme color",
  },
  {
    name: "purple",
    label: "Purple",
    lightColor: "hsl(270, 95%, 65%)",
    darkColor: "hsl(270, 95%, 75%)",
    description: "Default dark theme color",
  },
  {
    name: "blue",
    label: "Blue",
    lightColor: "hsl(217, 91%, 50%)",
    darkColor: "hsl(217, 91%, 60%)",
    description: "Classic blue accent",
  },
  {
    name: "red",
    label: "Red",
    lightColor: "hsl(0, 84%, 50%)",
    darkColor: "hsl(0, 84%, 60%)",
    description: "Bold red accent",
  },
  {
    name: "orange",
    label: "Orange",
    lightColor: "hsl(25, 95%, 53%)",
    darkColor: "hsl(25, 95%, 63%)",
    description: "Vibrant orange",
  },
  {
    name: "pink",
    label: "Pink",
    lightColor: "hsl(330, 81%, 60%)",
    darkColor: "hsl(330, 81%, 70%)",
    description: "Playful pink",
  },
  {
    name: "teal",
    label: "Teal",
    lightColor: "hsl(173, 80%, 40%)",
    darkColor: "hsl(173, 80%, 50%)",
    description: "Calming teal",
  },
  {
    name: "indigo",
    label: "Indigo",
    lightColor: "hsl(231, 48%, 48%)",
    darkColor: "hsl(231, 48%, 58%)",
    description: "Deep indigo",
  },
];

export function ColorPicker({
  selectedColor,
  onColorSelect,
}: ColorPickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {colorOptions.map((color) => (
          <div
            key={color.name}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200",
              selectedColor === color.name
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onColorSelect(color.name)}
          >
            {/* Color Preview */}
            <div className="flex items-center space-x-2">
              {/* Light mode color */}
              <div
                className="h-6 w-6 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: color.lightColor }}
              />
              {/* Dark mode color */}
              <div
                className="h-6 w-6 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: color.darkColor }}
              />
            </div>

            {/* Color Info */}
            <div className="mt-2">
              <p className="text-sm font-medium text-foreground">
                {color.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {color.description}
              </p>
            </div>

            {/* Selection indicator */}
            {selectedColor === color.name && (
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary"></div>
            )}
          </div>
        ))}
      </div>

      {/* Color Preview Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Preview</h4>
        <div className="flex items-center space-x-4">
          {/* Light mode preview */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">Light Mode</p>
            <div className="rounded-md border border-border bg-white p-3">
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: colorOptions.find(
                      (c) => c.name === selectedColor
                    )?.lightColor,
                  }}
                />
                <div className="text-xs text-gray-700">Primary Color</div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                <div className="h-2 w-1/2 rounded bg-gray-100"></div>
              </div>
            </div>
          </div>

          {/* Dark mode preview */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">Dark Mode</p>
            <div className="rounded-md border border-border bg-gray-900 p-3">
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: colorOptions.find(
                      (c) => c.name === selectedColor
                    )?.darkColor,
                  }}
                />
                <div className="text-xs text-gray-300">Primary Color</div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-2 w-3/4 rounded bg-gray-700"></div>
                <div className="h-2 w-1/2 rounded bg-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
