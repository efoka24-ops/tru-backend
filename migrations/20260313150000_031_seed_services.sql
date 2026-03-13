-- Seed: insert the 8 TRU Group services

INSERT INTO services (icon, title, description, features, objective, color, image_url)
VALUES
  (
    'Building2',
    'Conseil en organisation et performance',
    'Nous analysons vos processus, clarifions les rôles et mettons en place une gouvernance efficace pour améliorer durablement la performance.',
    '["Audit organisationnel", "Optimisation des processus", "Gouvernance et pilotage", "Conduite du changement"]'::jsonb,
    'Optimiser les opérations et renforcer la qualité de service.',
    'from-blue-500 to-indigo-600',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
  ),
  (
    'Monitor',
    'Transformation digitale',
    'Nous concevons et déployons votre feuille de route digitale: dématérialisation, automatisation et modernisation des parcours métier.',
    '["Feuille de route digitale", "Dématérialisation", "Automatisation des workflows", "Modernisation des parcours"]'::jsonb,
    'Accélérer la transformation et réduire les frictions internes.',
    'from-amber-500 to-orange-600',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop'
  ),
  (
    'Code2',
    'Développement d''applications web et mobile',
    'Nous réalisons des plateformes web et mobiles sur mesure, sécurisées et évolutives, adaptées à vos besoins métier.',
    '["Applications web", "Applications mobiles", "Portails métier", "Maintenance évolutive"]'::jsonb,
    'Digitaliser vos services avec des outils fiables et performants.',
    'from-emerald-500 to-teal-600',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop'
  ),
  (
    'BarChart3',
    'Data, BI et tableaux de bord',
    'Nous structurons vos données et mettons en place des tableaux de bord décisionnels pour piloter vos activités en temps réel.',
    '["Collecte et qualité des données", "Modélisation", "Dashboards KPI", "Reporting décisionnel"]'::jsonb,
    'Décider plus vite et mieux grâce à la donnée.',
    'from-cyan-500 to-blue-600',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
  ),
  (
    'ShieldCheck',
    'Cybersécurité et conformité',
    'Nous renforçons la sécurité de vos systèmes avec audits, politiques, sensibilisation et plan de gestion des risques.',
    '["Audit sécurité", "Gestion des risques", "Conformité", "Sensibilisation des équipes"]'::jsonb,
    'Protéger vos actifs numériques et garantir la continuité d''activité.',
    'from-rose-500 to-red-600',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
  ),
  (
    'CloudCog',
    'Cloud, DevOps et infrastructure',
    'Nous accompagnons vos migrations cloud, l''industrialisation CI/CD et l''optimisation de l''infrastructure.',
    '["Migration cloud", "CI/CD", "Supervision", "Optimisation des coûts"]'::jsonb,
    'Gagner en disponibilité, scalabilité et rapidité de livraison.',
    'from-sky-500 to-indigo-600',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'
  ),
  (
    'GraduationCap',
    'Formation et renforcement des capacités',
    'Nous proposons des formations pratiques et certifiantes pour équipes techniques, métiers et management.',
    '["Formations certifiantes", "Ateliers pratiques", "Coaching d''équipe", "Évaluation des acquis"]'::jsonb,
    'Monter en compétences de façon mesurable et durable.',
    'from-fuchsia-500 to-pink-600',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop'
  ),
  (
    'Briefcase',
    'Assistance technique et gestion de projet',
    'Nous mettons à disposition des experts pour piloter vos projets (PMO, Agile, qualité, coordination).',
    '["PMO", "Pilotage Agile", "Suivi qualité", "Coordination multi-acteurs"]'::jsonb,
    'Assurer la réussite opérationnelle de vos projets stratégiques.',
    'from-violet-500 to-purple-600',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;
