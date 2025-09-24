export interface NavigationChild {
  name: string;
  href: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationChild[];
}

export interface Navigation {
  name: string;
  href: string;
  hasDropdown?: boolean;
  hasUnderline?: boolean;
  items?: NavigationItem[];
}

export type NavigationData = Navigation[];