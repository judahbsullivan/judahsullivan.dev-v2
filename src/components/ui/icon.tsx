import { forwardRef } from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: string | number;
  color?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  function Icon({ name, size = 24, className = '', color, ...props }, ref) {
    // Extract icon name (remove 'lucide:' prefix if present)
    const iconName = name.includes(':') ? name.split(':')[1] : name;
    const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }> | undefined;
    
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in lucide-react`);
      return null;
    }
    
    return (
      <IconComponent
        ref={ref}
        className={`inline-block align-middle ${className}`}
        size={size}
        style={color ? { color } : undefined}
        {...props}
      />
    );
  }
);

