import { Navigation, NavigationData } from '@/types/navigation';
import useCategories from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';

export function useNavigationData() {
  const { t } = useTranslation();
  const { data = { flat: [], tree: [] }, isLoading } = useCategories({ includeDescendantsTree: true, fields: "id,name,handle,category_children,description,parent_category_id" });

  const categoriesData = data.tree && data.tree.length ? data.tree : data.flat;

  const processCategory = (cat: any) => {
    const result = {
      name: cat.name,
      href: `/categories/${cat.handle}`,
      hasDropdown: Boolean(cat.category_children?.length),
      items: []
    };

    if (cat.category_children && cat.category_children.length > 0) {
      const children = cat.category_children.map((child: any) => {
        const childItem = {
          name: child.name,
          href: `/categories/${child.handle}`
        };

        if (child.category_children && child.category_children.length > 0) {
          return {
            ...childItem,
            children: child.category_children.map((grandChild: any) => ({
              name: grandChild.name,
              href: `/categories/${grandChild.handle}`
            }))
          };
        }

        return childItem;
      });

      result.items = children;
    }

    return result;
  };

  const navigation: NavigationData = [
    ...categoriesData.map(processCategory),
    {
      name: t('nav.products'),
      href: '/products',
      hasUnderline: true
    }
  ];

  return {
    navigation,
    categories: categoriesData,
    isLoading
  };
}
