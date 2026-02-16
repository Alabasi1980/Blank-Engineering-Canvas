# الورقة التقنية (Technical Whitepaper)

## البنية التحتية (Stack)
- **Frontend:** React 19 + TypeScript.
- **Styling:** Tailwind CSS (للواجهات الديناميكية).
- **Icons:** Lucide React.
- **Data Processing:** محرك داخلي مبني بـ TypeScript يعتمد على `Context-based Logic`.
- **Storage:** IndexedDB (عبر نظام DatasetStorage) لتخزين آلاف الحركات المالية محلياً وبسرعة فائقة.

## أمن وسلامة البيانات
- **Local-First Architecture:** كافة البيانات والمعادلات تُعالج وتُخزن داخل متصفح المستخدم، مما يوفر خصوصية 100% للبيانات المالية الحساسة.
- **Circular Reference Protection:** خوارزميات فحص تمنع المستخدم من بناء علاقات هرمية دائرية في شجرة الحسابات أو المواقع.
- **Formula Sanitization:** نظام حماية يمنع حقن أكواد خبيثة داخل المعادلات الرياضية.

## الأداء (Performance)
- المحرك قادر على معالجة آلاف الحركات المالية في أجزاء من الثانية بفضل تقنيات `Map-Reduce` و `Pre-computed Adjacency Maps` للقوائم الشجرية.
