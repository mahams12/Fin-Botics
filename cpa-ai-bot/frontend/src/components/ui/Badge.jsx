import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'badge';
  
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.default}
    ${className}
  `.trim();

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;