import { GenericTreeNode, MasterEntityDefinition } from '../../types';

export const MasterDataService = {
    generateId(entityDef: MasterEntityDefinition, name: string): string {
        const prefix = entityDef.id.slice(0, 3).toUpperCase();
        return `${prefix}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
    },

    getForbiddenParents(itemId: string, allItems: GenericTreeNode[]): Set<string> {
        const forbidden = new Set<string>([itemId]);
        const addDescendants = (parentId: string) => {
            allItems.forEach(item => {
                if (item.parentId === parentId) {
                    forbidden.add(item.id);
                    addDescendants(item.id);
                }
            });
        };
        addDescendants(itemId);
        return forbidden;
    },

    buildFlatRows(items: GenericTreeNode[], searchTerm: string, expandedNodes: Set<string>, isTree: boolean) {
        const nodeMap = new Map<string, any>();
        const roots: string[] = [];
        items.forEach(item => nodeMap.set(item.id, { ...item, children: [] }));
        items.forEach(item => {
            if (item.parentId && nodeMap.has(item.parentId)) nodeMap.get(item.parentId).children.push(item.id);
            else roots.push(item.id);
        });

        const term = searchTerm.toLowerCase();
        const visibleIds = new Set<string>();
        const checkMatch = (id: string): boolean => {
            const node = nodeMap.get(id);
            if (!node) return false;
            let match = !term || node.name.toLowerCase().includes(term) || node.id.toLowerCase().includes(term);
            let childMatch = false;
            node.children.forEach((cid: string) => { if (checkMatch(cid)) childMatch = true; });
            if (match || childMatch) { visibleIds.add(id); return true; }
            return false;
        };
        roots.forEach(checkMatch);

        const rows: any[] = [];
        const traverse = (ids: string[], level: number) => {
            ids.forEach(id => {
                if (!visibleIds.has(id)) return;
                const node = nodeMap.get(id);
                rows.push({ node, level, hasChildren: node.children.length > 0 });
                if (node.children.length > 0 && (expandedNodes.has(id) || term)) traverse(node.children, level + 1);
            });
        };

        if (!isTree) return roots.map(id => ({ node: nodeMap.get(id), level: 0, hasChildren: false })).filter(r => visibleIds.has(r.node.id));
        traverse(roots, 0);
        return rows;
    }
};