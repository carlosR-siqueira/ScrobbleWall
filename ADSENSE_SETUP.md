# Configuração do Google AdSense - ScrobbleWall

## Visão Geral
Este documento descreve a implementação do Google AdSense no projeto ScrobbleWall, incluindo todos os componentes, configurações e slots utilizados.

## Configurações Implementadas

### 1. Script do AdSense
- **Localização**: `src/app/layout.tsx`
- **Estratégia**: `beforeInteractive` para carregamento prioritário
- **ID do Cliente**: `ca-pub-8940704424317590`
- **Observação**: Sem event handlers para evitar erros de Server Component

### 2. Componentes de Propaganda

#### GoogleResponsiveAd
- **Arquivo**: `src/app/components/adsComponents/GoogleResponsiveAd.tsx`
- **Funcionalidade**: Propaganda responsiva que se adapta a diferentes tamanhos de tela
- **Slots**: 
  - `top`: `3404072661` (responsivo)
  - `bottom`: `9969481018` (multiplex)
- **Formato**: `horizontal` forçado para evitar formato vertical
- **Props**: `position`, `forceHorizontal`
- **Posicionamento**: Páginas principais
- **Recursos**: Tratamento de erros, logging, indicador de carregamento

#### GoogleMobileAd
- **Arquivo**: `src/app/components/adsComponents/GoogleMobileAd.tsx`
- **Funcionalidade**: Alterna automaticamente entre horizontal (mobile) e multiplex (desktop)
- **Mobile**: GoogleHorizontalAd (≤768px)
- **Desktop**: GoogleMultiplexAd (>768px)
- **Uso**: Páginas sobre e conectar
- **Recursos**: Detecção automática de dispositivo, responsividade otimizada

#### GoogleMultiplexAd
- **Arquivo**: `src/app/components/adsComponents/GoogleMultiplexAd.tsx`
- **Funcionalidade**: Propaganda multiplex com formato autorelaxed
- **Slot**: `9969481018`
- **Formato**: `autorelaxed`
- **Uso**: Páginas com conteúdo extenso e segundo anúncio
- **Recursos**: Tratamento de erros, logging, indicador de carregamento, responsividade mobile otimizada

#### GoogleHorizontalAd
- **Arquivo**: `src/app/components/adsComponents/GoogleHorizontalAd.tsx`
- **Funcionalidade**: Propaganda horizontal fixa
- **Slot**: `3404072661`
- **Formato**: `horizontal`
- **Uso**: Mobile e páginas secundárias
- **Recursos**: Otimizado para mobile, formato horizontal forçado

#### GoogleArticleAd
- **Arquivo**: `src/app/components/adsComponents/GoogleArticleAd.tsx`
- **Funcionalidade**: Propaganda in-article com layout fluid
- **Slot**: `6493270436`
- **Formato**: `fluid` com `data-ad-layout="in-article"`
- **Uso**: Dentro de artigos e conteúdo textual
- **Recursos**: Tratamento de erros, logging, indicador de carregamento

#### AdWrapper
- **Arquivo**: `src/app/components/adsComponents/AdWrapper.tsx`
- **Funcionalidade**: Wrapper para propagandas com espaçamento consistente
- **Uso**: Garante espaçamento adequado entre conteúdo e propagandas
- **Props**: `topMargin`, `bottomMargin`, `className`

#### GoogleVerticalAd
- **Arquivo**: `src/app/components/adsComponents/GoogleVerticalAd.tsx`
- **Funcionalidade**: Propaganda vertical para sidebars
- **Slot**: `3404072661`
- **Uso**: Páginas com layout em colunas

#### AdSenseLoader
- **Arquivo**: `src/app/components/adsComponents/AdSenseLoader.tsx`
- **Funcionalidade**: Monitora o carregamento do script do AdSense
- **Uso**: Componente invisível no layout principal

### 3. Configuração Centralizada
- **Arquivo**: `src/app/config/adsense.ts`
- **Slots Disponíveis**:
  - `HORIZONTAL`: `3404072661` (Slot original - horizontal)
  - `VERTICAL`: `3404072661` (Slot original - vertical)
  - `RESPONSIVE`: `3404072661` (Slot original - responsivo)
  - `MULTIPLEX`: `9969481018` (Novo slot - multiplex)
  - `ARTICLE`: `6493270436` (Novo slot - in-article)
  - `SIDEBAR`: `7699203606` (Novo slot - vertical para sidebar)
- **Benefícios**: 
  - Configurações centralizadas
  - Fácil manutenção
  - Consistência entre componentes

### 4. Arquivos de Configuração

#### ads.txt
- **Localização**: `public/ads.txt`
- **Conteúdo**: Autorização do Google AdSense

#### app-ads.txt
- **Localização**: `public/app-ads.txt`
- **Conteúdo**: Autorização para aplicações web

## Posicionamento das Propagandas

### Página Inicial (`/`)
1. Após a seção de boas-vindas (slot responsivo)
2. No final da página (slot multiplex)

### Página de Geração (`/generate`)
1. Após o formulário (etapa formulário) - 40px top margin
2. Antes da grade de álbuns (etapa resultado) - 20px margins
3. Após a grade de álbuns (etapa resultado) - 20px margins (AdWrapper mantido)

### Página Sobre (`/sobre`)
1. Após a introdução (GoogleResponsiveAd)
2. No final da página (GoogleMobileAd - horizontal no mobile, multiplex no desktop)

### Página Conectar (`/conectar`)
1. Após a introdução (GoogleMobileAd - horizontal no mobile, multiplex no desktop)
2. No final da página (GoogleMobileAd - horizontal no mobile, multiplex no desktop)

### Página Política de Privacidade (`/politica-de-privacidade`)
1. Após a introdução (slot responsivo)
2. No final da página (slot multiplex)

### Página Termos de Uso (`/termos-de-uso`)
1. Após a introdução (slot responsivo)
2. No final da página (slot multiplex)

### Página Contato (`/contato`)
1. No final da página (slot multiplex)

### Páginas sem Anúncios
- **Página de Doação** (`/donate`): Não possui anúncios para não interferir na experiência de doação

## Melhorias Implementadas

### 1. Carregamento Otimizado
- Delay de 1 segundo para garantir carregamento do script
- Tratamento de erros robusto
- Indicador de carregamento
- Logging detalhado no console

### 2. Responsividade
- Detecção automática de dispositivo móvel
- Tamanhos adaptativos
- Breakpoints configuráveis

### 3. SEO e Performance
- Meta tags específicas para AdSense
- Carregamento não-bloqueante
- Configurações de robots

### 4. Tratamento de Erros
- Verificação da disponibilidade do script AdSense
- Mensagens de erro amigáveis
- Fallbacks para casos de falha

### 5. Layout e Espaçamento
- Header com altura fixa (70px)
- Container principal com margin-top adequado (90px)
- Componente AdWrapper para espaçamento consistente
- Propagandas não interferem com o layout do conteúdo

### 6. Novos Formatos de Propaganda
- **Multiplex**: Formato autorelaxed para melhor experiência
- **In-Article**: Propaganda integrada ao conteúdo
- **Responsivo**: Adaptação automática a diferentes dispositivos

### 7. Estilos CSS Globais
- **Arquivo**: `src/app/globals.css`
- **Funcionalidade**: Estilos específicos para propagandas
- **Benefícios**: 
  - Garantir formato horizontal
  - Evitar conflitos de layout
  - Responsividade adequada
  - Prevenção de quebras de layout
  - **Mobile otimizado**: Forçar exibição em dispositivos móveis

### 8. Cobertura Completa
- **Páginas com anúncios**: 7 páginas principais
- **Estratégia**: Anúncios após introdução e no final
- **Consistência**: Mesmo padrão em todas as páginas
- **Experiência**: Não interfere com funcionalidades críticas

### 9. Responsividade Mobile
- **Estilos específicos**: CSS otimizado para mobile
- **Forçar exibição**: Propriedades CSS para garantir visibilidade
- **Tamanhos adaptativos**: 320px para mobile, 300px para mobile pequeno
- **Overflow visible**: Evitar cortes de conteúdo
- **Componente adaptativo**: GoogleMobileAd alterna automaticamente

### 10. Componente Inteligente
- **GoogleMobileAd**: Detecta automaticamente o dispositivo
- **Mobile (≤768px)**: Renderiza GoogleHorizontalAd
- **Desktop (>768px)**: Renderiza GoogleMultiplexAd
- **Responsivo**: Adapta-se a mudanças de tamanho de tela

## Troubleshooting

### Propagandas não aparecem
1. Verificar se o script está carregando no console (procure por "✅ AdSense script loaded successfully")
2. Confirmar se o site está aprovado no AdSense
3. Verificar se não há bloqueadores de propaganda ativos
4. Verificar mensagens de erro no console

### Propagandas não aparecem no mobile
1. Verificar se os estilos CSS estão sendo aplicados corretamente
2. Confirmar se não há conflitos de overflow ou z-index
3. Verificar se as propriedades `display: block !important` estão ativas
4. Testar em diferentes navegadores mobile
5. Verificar se o componente GoogleMobileAd está funcionando corretamente

### Propagandas quebram o layout
1. Verificar se os containers têm altura mínima adequada
2. Confirmar se os estilos CSS não conflitam
3. Testar em diferentes dispositivos
4. Usar o componente AdWrapper para espaçamento consistente

### Performance
1. Monitorar métricas de Core Web Vitals
2. Verificar se as propagandas não estão bloqueando o carregamento
3. Considerar lazy loading para propagandas abaixo da dobra

### Erros de Console
- **"AdSense script not available"**: O script não carregou corretamente
- **"Ad loaded successfully"**: Propaganda carregada com sucesso
- **"AdSense script may not have loaded properly"**: Timeout no carregamento
- **"Horizontal Ad loaded successfully"**: Anúncio horizontal carregado

## Correções Recentes

### Erro de Server Component
- **Problema**: Event handlers não podem ser passados para Server Components
- **Solução**: Removidos `onLoad` e `onError` do componente Script
- **Alternativa**: Criado componente `AdSenseLoader` para monitoramento

### Problema de Layout na Página Generate
- **Problema**: Formulário ficava embaixo do header fixo
- **Solução**: 
  - Criado estilo específico `.generateFormContainer` com `margin-top: 100px`
  - Adicionada prop `isGeneratePage` ao componente `CollageSection`
  - Propagandas posicionadas estrategicamente sem interferir no layout
  - Header e container principal mantidos no estado original

### Correção do Formato Vertical
- **Problema**: Propagandas apareciam verticalmente quando deveriam ser horizontais
- **Solução**: 
  - Adicionado prop `forceHorizontal={true}`
  - Definido `data-ad-format="horizontal"`
  - Adicionados estilos CSS específicos
  - Altura mínima forçada para 90px

### Correção do Segundo Anúncio
- **Problema**: Segundo anúncio não aparecia na mesma página
- **Solução**: 
  - Implementado sistema de slots diferentes por posição
  - Primeiro anúncio: slot responsivo (`3404072661`)
  - Segundo anúncio: slot multiplex (`9969481018`)
  - Props `position` para diferenciar os anúncios

### Implementação em Todas as Páginas
- **Adicionado**: Anúncios em 7 páginas principais
- **Estratégia**: Posicionamento consistente (após introdução + final)
- **Slots**: Uso inteligente de slots diferentes para evitar conflitos
- **Experiência**: Mantida qualidade da experiência do usuário

### Correção de Problemas Mobile
- **Problema**: Propagandas não apareciam em dispositivos móveis
- **Solução**:
  - Adicionados estilos CSS específicos para mobile
  - Forçada exibição com `display: block !important`
  - Otimizados tamanhos para diferentes breakpoints
  - Adicionado `overflow: visible` para evitar cortes
  - Melhorada responsividade dos containers

### Criação do Componente GoogleMobileAd
- **Problema**: Necessidade de anúncios diferentes para mobile e desktop
- **Solução**:
  - Criado componente que detecta automaticamente o dispositivo
  - Mobile (≤768px): GoogleHorizontalAd
  - Desktop (>768px): GoogleMultiplexAd
  - Implementado nas páginas sobre e conectar

### Alterações do Usuário Mantidas
- **Página Generate**: AdWrapper mantido após resultado
- **Página Sobre**: GoogleResponsiveAd + GoogleMobileAd
- **Página Conectar**: Ambos os anúncios com GoogleMobileAd

## Uso dos Componentes

### GoogleResponsiveAd
```tsx
// Primeiro anúncio (topo da página)
<GoogleResponsiveAd position="top" forceHorizontal={true} />

// Segundo anúncio (final da página)
<GoogleResponsiveAd position="bottom" forceHorizontal={true} />
```

### GoogleMobileAd
```tsx
// Anúncio que alterna automaticamente entre mobile e desktop
<GoogleMobileAd />
```

### GoogleMultiplexAd
```tsx
// Anúncio multiplex (melhor para desktop)
<GoogleMultiplexAd />
```

### Outros Componentes
```tsx
// In-article para artigos
<GoogleArticleAd />

// Wrapper para espaçamento
<AdWrapper topMargin={20} bottomMargin={20} />
```

## Páginas com Anúncios Implementados

### ✅ Páginas Principais
1. **Página Inicial** (`/`) - 2 anúncios
2. **Página de Geração** (`/generate`) - 3 anúncios (AdWrapper mantido)
3. **Página Sobre** (`/sobre`) - 2 anúncios (GoogleResponsiveAd + GoogleMobileAd)
4. **Página Conectar** (`/conectar`) - 2 anúncios (ambos GoogleMobileAd)
5. **Página Política de Privacidade** (`/politica-de-privacidade`) - 2 anúncios
6. **Página Termos de Uso** (`/termos-de-uso`) - 2 anúncios
7. **Página Contato** (`/contato`) - 1 anúncio

### ❌ Páginas sem Anúncios
- **Página de Doação** (`/donate`) - Intencionalmente sem anúncios

## Próximos Passos

1. **Monitoramento**: Implementar analytics para performance das propagandas
2. **A/B Testing**: Testar diferentes posicionamentos
3. **Otimização**: Ajustar baseado em métricas de CTR
4. **Novos Formatos**: Implementar propagandas sticky e outros formatos avançados

## Contato
Para dúvidas sobre a implementação do AdSense, consulte a documentação oficial do Google ou entre em contato com a equipe de desenvolvimento. 

## Configuração Centralizada

### Arquivo de Configuração
- **Localização**: `src/app/config/adsense.ts`
- **Função**: Centraliza todas as configurações do AdSense (client ID, slots, breakpoints, etc.)

### Slots Configurados
```typescript
SLOTS: {
  HORIZONTAL: '3404072661',      // Slot original - horizontal
  VERTICAL: '3404072661',        // Slot original - vertical  
  RESPONSIVE: '3404072661',      // Slot original - responsivo
  MULTIPLEX: '9969481018',       // Novo slot - multiplex
  ARTICLE: '6493270436',         // Novo slot - in-article
  SIDEBAR: '7699203606'          // Novo slot - vertical para sidebar (120x500)
}
```

## Componentes de Propaganda

### 1. GoogleResponsiveAd
- **Arquivo**: `src/app/components/adsComponents/GoogleResponsiveAd.tsx`
- **Função**: Anúncio responsivo que se adapta ao tamanho da tela
- **Slot**: `RESPONSIVE` (3404072661)
- **Características**:
  - Adapta-se automaticamente ao dispositivo
  - Suporte a `forceHorizontal` para forçar formato horizontal
  - Tratamento de erros e loading states

### 2. GoogleHorizontalAd
- **Arquivo**: `src/app/components/adsComponents/GoogleHorizontalAd.tsx`
- **Função**: Anúncio horizontal fixo (728x90)
- **Slot**: `HORIZONTAL` (3404072661)
- **Características**:
  - Tamanho fixo para desktop
  - Responsivo para mobile (320x50)
  - Tratamento de erros melhorado

### 3. GoogleVerticalAd
- **Arquivo**: `src/app/components/adsComponents/GoogleVerticalAd.tsx`
- **Função**: Anúncio vertical fixo (300x600)
- **Slot**: `VERTICAL` (3404072661)
- **Características**:
  - Tamanho fixo para desktop
  - Oculto em mobile

### 4. GoogleMultiplexAd
- **Arquivo**: `src/app/components/adsComponents/GoogleMultiplexAd.tsx`
- **Função**: Anúncio multiplex (múltiplos anúncios em um slot)
- **Slot**: `MULTIPLEX` (9969481018)
- **Características**:
  - Exibe múltiplos anúncios simultaneamente
  - Layout responsivo

### 5. GoogleArticleAd
- **Arquivo**: `src/app/components/adsComponents/GoogleArticleAd.tsx`
- **Função**: Anúncio in-article (dentro do conteúdo)
- **Slot**: `ARTICLE` (6493270436)
- **Características**:
  - Integrado ao conteúdo do artigo
  - Layout responsivo

### 6. GoogleSidebarAd
- **Arquivo**: `src/app/components/adsComponents/GoogleSidebarAd.tsx`
- **Função**: Anúncio vertical para sidebar (120x500)
- **Slot**: `SIDEBAR` (7699203606)
- **Características**:
  - Tamanho fixo 120x500px (atualizado)
  - Específico para laterais das páginas
  - Apenas em desktop

### 7. GoogleMobileAd
- **Arquivo**: `src/app/components/adsComponents/GoogleMobileAd.tsx`
- **Função**: Componente que alterna entre anúncios baseado no dispositivo
- **Características**:
  - Mobile: GoogleHorizontalAd
  - Desktop: GoogleMultiplexAd
  - Detecção automática de tela

### 8. PageWithSidebarAds
- **Arquivo**: `src/app/components/adsComponents/PageWithSidebarAds.tsx`
- **Função**: Wrapper que adiciona anúncios laterais nas páginas
- **Características**:
  - Layout de 3 colunas em desktop (anúncio | conteúdo | anúncio)
  - Anúncios laterais apenas em desktop (>768px)
  - Anúncios sticky (fixos durante scroll)
  - Layout otimizado para não espremer o conteúdo principal
  - Em mobile: apenas o conteúdo (sem anúncios laterais)

## Implementação nas Páginas

### Página Principal (`src/app/page.tsx`)
```tsx
// Anúncio responsivo com formato horizontal forçado
<GoogleResponsiveAd position="top" forceHorizontal={true} />
```

### Páginas com Anúncios Laterais
As seguintes páginas usam o wrapper `PageWithSidebarAds`:

#### Sobre (`src/app/sobre/page.tsx`)
```tsx
<PageWithSidebarAds>
  <div className={styles.container}>
    {/* Conteúdo da página */}
    <GoogleResponsiveAd position="top" forceHorizontal={true} />
    <GoogleMobileAd />
  </div>
</PageWithSidebarAds>
```

#### Conectar (`src/app/conectar/page.tsx`)
```tsx
<PageWithSidebarAds>
  <div className={styles.container}>
    {/* Conteúdo da página */}
    <GoogleMobileAd />
  </div>
</PageWithSidebarAds>
```

#### Contato (`src/app/contato/page.tsx`)
```tsx
<PageWithSidebarAds>
  <div className={styles.container}>
    {/* Conteúdo da página */}
    <GoogleResponsiveAd position="bottom" forceHorizontal={true} />
  </div>
</PageWithSidebarAds>
```

### Outras Páginas
- **Doar**: GoogleResponsiveAd + GoogleMultiplexAd
- **Política de Privacidade**: GoogleResponsiveAd + GoogleMultiplexAd
- **Termos de Uso**: GoogleResponsiveAd + GoogleMultiplexAd

## Layout dos Anúncios Laterais

### Desktop (>768px)
```
┌───────────┬─────────────────────┬───────────┐
│  Anúncio  │                     │  Anúncio  │
│  Lateral  │    Conteúdo         │  Lateral  │
│ (120px)   │   Principal         │ (120px)   │
│           │                     │           │
│  Sticky   │                     │  Sticky   │
└───────────┴─────────────────────┴───────────┘
```

### Mobile (≤768px)
```
┌─────────────────────────────────────────────┐
│                                             │
│              Conteúdo Principal             │
│                                             │
│              (Sem anúncios laterais)        │
│                                             │
└─────────────────────────────────────────────┘
```

## Estilos CSS

### Arquivo Principal
- **Localização**: `src/app/globals.css`
- **Seções**:
  - Estilos globais para todos os containers de anúncio
  - Estilos específicos para anúncios da sidebar
  - Responsividade para mobile
  - Garantias de visibilidade e display
  - Melhorias específicas para mobile

### Características dos Estilos
- **Anúncios Laterais**: 120px × 500px, sticky positioning
- **Responsividade**: Ocultos em mobile (≤768px)
- **Visibilidade**: Forçada em mobile para evitar problemas de display
- **Overflow**: Configurado como `visible` para evitar cortes
- **Mobile**: Estilos específicos para garantir exibição

## Carregamento e Performance

### Script do AdSense
- **Localização**: `src/app/layout.tsx`
- **Carregamento**: Assíncrono com crossorigin
- **Client ID**: `ca-pub-8940704424317590`

### Tratamento de Erros
- Todos os componentes incluem tratamento de erros
- Estados de loading para melhor UX
- Fallbacks para quando o AdSense não está disponível

### Otimizações
- Carregamento assíncrono dos scripts
- Delay configurável para garantir carregamento
- Detecção de disponibilidade do AdSense

## Monitoramento e Debug

### Console Logs
- ✅ Sucesso no carregamento
- ⚠️ Avisos sobre scripts não disponíveis
- ❌ Erros de carregamento

### Estados dos Componentes
- `adLoaded`: Indica se o anúncio foi carregado
- `error`: Mensagem de erro se houver problemas
- `isDesktop`: Detecção de dispositivo para anúncios laterais

## Configurações do AdSense

### Slots Utilizados
1. **3404072661**: Slot original (horizontal/vertical/responsivo)
2. **9969481018**: Slot multiplex
3. **6493270436**: Slot in-article
4. **7699203606**: Slot sidebar (vertical 120x500)

### Formatos Suportados
- Horizontal: 728×90 (desktop), 320×50 (mobile)
- Vertical: 300×600 (desktop), 120×500 (sidebar)
- Responsivo: Adaptável
- Multiplex: Múltiplos anúncios
- In-article: Integrado ao conteúdo

## Melhorias Recentes

### Correções de Layout
- **Anúncios Laterais**: Reduzidos de 250x450px para 120x500px
- **Layout Principal**: Aumentado maxWidth para 1400px
- **Gap**: Reduzido de 20px para 15px
- **Conteúdo Principal**: Melhor flexibilidade com minWidth: 0

### Correções Mobile
- **Visibilidade**: Forçada com !important
- **Display**: Garantido com flex !important
- **Width**: Configurado para 100% em mobile
- **Iframes**: Garantida exibição dos anúncios

## Manutenção

### Adicionando Novos Slots
1. Adicionar o slot em `src/app/config/adsense.ts`
2. Criar componente específico se necessário
3. Atualizar esta documentação

### Modificando Layouts
1. Ajustar estilos em `src/app/globals.css`
2. Testar responsividade
3. Verificar visibilidade em mobile

### Troubleshooting
- Verificar console para erros
- Confirmar carregamento do script AdSense
- Testar em diferentes dispositivos
- Verificar breakpoints CSS
- Verificar se os estilos mobile estão sendo aplicados 