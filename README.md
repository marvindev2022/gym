# TreinoZap

> **Seu aluno treina mais. Falta menos. Você cobra melhor.**

Plataforma SaaS para personal trainers independentes gerenciarem alunos, treinos e cobranças via WhatsApp — sem depender de apps complexos ou planilhas.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend / PWA | React 18 + Vite + vite-plugin-pwa |
| App nativo (Play Store) | Capacitor |
| Backend | Python Flask + SQLAlchemy |
| Banco de dados | Supabase (PostgreSQL + Auth + Storage) |
| Design System | Próprio (`@treinozap/ui`) — dark mode, tokens gold + electric |
| Monorepo | Turborepo + pnpm workspaces |
| Mensageria | WhatsApp via Evolution API |

---

## Estrutura do monorepo

```
gym/
├── apps/
│   ├── web/          # PWA React — painel do personal + área do aluno
│   └── api/          # Flask — REST API + jobs de automação
├── packages/
│   ├── ui/           # Componentes React compartilhados (design system)
│   ├── types/        # Tipos TypeScript compartilhados
│   └── config/       # ESLint, TSConfig e Tailwind base configs
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Como rodar

```bash
# Instalar dependências de todos os packages
pnpm install

# Rodar todos os apps em modo dev (web + api)
pnpm dev

# Rodar apenas o frontend
pnpm --filter @treinozap/web dev

# Rodar apenas a API
pnpm --filter @treinozap/api dev

# Build de produção
pnpm build

# Lint em todo o monorepo
pnpm lint
```

**Pré-requisitos**: Node >= 20, pnpm 9.15.0, Python 3.12+

---

## Planos

| Plano | Preço | Limite de alunos | Recursos |
|-------|-------|-----------------|----------|
| **Grátis** | R$ 0/mês | 5 alunos | Treinos, link público, painel básico |
| **Pro** | R$ 49/mês | Ilimitado | Tudo do Grátis + cobranças, relatórios, histórico |
| **Premium** | R$ 99/mês | Ilimitado | Tudo do Pro + automações WhatsApp, lembretes de pagamento, relatório de evolução |

---

## Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| `tz-bg` | `#0A0A0A` | Fundo principal |
| `tz-surface` | `#141414` | Cards e painéis |
| `tz-surface-2` | `#1E1E1E` | Inputs, dropdowns |
| `tz-border` | `#2A2A2A` | Bordas e divisores |
| `tz-gold` | `#C8A96E` | Cor primária — CTAs, destaques |
| `tz-gold-light` | `#E4C98A` | Hover states do gold |
| `tz-gold-dark` | `#A88A52` | Active states do gold |
| `tz-electric` | `#D4FF3C` | Cor de acento — badges, indicadores |
| `tz-electric-dark` | `#AACC00` | Hover do electric |
| `tz-white` | `#F0EDE8` | Texto principal |
| `tz-muted` | `#6B6868` | Texto secundário, placeholders |
| `tz-success` | `#4ADE80` | Confirmações, pagamentos em dia |
| `tz-warning` | `#FBBF24` | Alertas, pagamento pendente |
| `tz-error` | `#F87171` | Erros, aluno bloqueado |

---

## Licença

Proprietário — Clarke Software © 2026
