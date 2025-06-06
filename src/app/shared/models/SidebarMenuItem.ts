import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface SidebarMenuItem {
  icon: IconDefinition;
  title: string;
  route: string;
  roles: string[]; 
}