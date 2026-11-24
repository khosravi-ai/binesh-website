import React from 'react';
import { RoutePath } from '../data/bineshData';

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: RoutePath;
  onNavigate: (route: RoutePath) => void;
  children: React.ReactNode;
}

/**
 * Semantic <a href="/..."> link component for crawlable internal SEO links
 * with seamless client-side navigation on standard left clicks.
 */
export const NavLink: React.FC<NavLinkProps> = ({
  href,
  onNavigate,
  onClick,
  children,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target === '_blank'
    ) {
      return;
    }
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
