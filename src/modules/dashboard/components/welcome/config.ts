
import { Cpu, Database, Calculator, GitBranch, LayoutDashboard, Award, Workflow } from 'lucide-react';
import { GuideModuleConfig } from './types';
import { ConceptModule } from './modules/1_ConceptModule';
import { SetupModule } from './modules/2_SetupModule';
import { LogicModule } from './modules/3_LogicModule';
import { WorkflowModule } from './modules/4_WorkflowModule';
import { AnalyticsModule } from './modules/5_AnalyticsModule';
import { CertificationModule } from './modules/6_CertificationModule';

export const GUIDE_MODULES: GuideModuleConfig[] = [
    {
        id: 'concept',
        title: '1. الفلسفة الجوهرية',
        icon: Cpu,
        color: 'indigo',
        summary: 'لماذا هذا النظام مختلف؟ فصل "البيانات" عن "القواعد".',
        component: ConceptModule
    },
    {
        id: 'setup',
        title: '2. هندسة البيانات',
        icon: Database,
        color: 'blue',
        summary: 'الفرق بين الأبعاد والقوائم المرجعية وكيف تبني شجرتك.',
        component: SetupModule
    },
    {
        id: 'logic',
        title: '3. مهندس المنطق',
        icon: Calculator,
        color: 'purple',
        summary: 'كيف تحول الأرقام الصامتة إلى "ذكاء مالي" عبر المعادلات.',
        component: LogicModule
    },
    {
        id: 'workflow',
        title: '4. دورة العمل الآمنة',
        icon: Workflow,
        color: 'amber',
        summary: 'كيف تضمن عدم "تخريب" التقارير؟ نظام المسودة والنشر.',
        component: WorkflowModule
    },
    {
        id: 'analytics',
        title: '5. فن التحليل',
        icon: LayoutDashboard,
        color: 'emerald',
        summary: 'استخدام الجداول المحورية للإجابة على الأسئلة الصعبة.',
        component: AnalyticsModule
    },
    {
        id: 'certification',
        title: 'أنت الآن مهندس بيانات!',
        icon: Award,
        color: 'slate',
        summary: 'لقد أتممت الرحلة المعرفية. أنت جاهز للبناء.',
        component: CertificationModule
    }
];
