// Menu data is loaded from menu.json - replace that file with your menu (see TEMPLATE.md)
import menuItemsData from './menu.json';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  isvegetarian: boolean;
  isspicy: boolean;
  category: string;
  menu_img?: string;
  sold_out: boolean;
}

export const menuItems: MenuItem[] = menuItemsData;
