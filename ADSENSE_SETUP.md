# Configuração do Google AdSense - ScrobbleWall

## Visão Geral
Este documento descreve a implementação do Google AdSense no projeto ScrobbleWall.

## Configurações Implementadas

### 1. Script do AdSense
- **Localização**: `src/app/layout.tsx`
- **Estratégia**: `beforeInteractive` para carregamento prioritário
- **ID do Cliente**: `ca-pub-8940704424317590`
- **Observação**: Sem event handlers para evitar erros de Server Component

### 2. Componentes de Propaganda

#### GoogleSmartAd
- **Arquivo**: `src/app/components/adsComponents/GoogleSmartAd.tsx`
- **Funcionalidade**: Propaganda inteligente que escolhe o melhor formato baseado no dispositivo
- **Comportamento**: 
  - Desktop: Força formato horizontal (728x90)
  - Mobile: Usa formato responsivo (320x250)
- **Uso**: Páginas principais onde queremos controle total do formato

#### GoogleResponsiveAd
- **Arquivo**: `src/app/components/adsComponents/GoogleResponsiveAd.tsx`
- **Funcionalidade**: Propaganda responsiva que se adapta a diferentes tamanhos de tela
- **Posicionamento**: Páginas principais (inicial, geração, sobre)
- **Recursos**: Tratamento de erros, logging, indicador de carregamento

#### AdWrapper
- **Arquivo**: `src/app/components/adsComponents/AdWrapper.tsx`
- **Funcionalidade**: Wrapper para propagandas com espaçamento consistente
- **Uso**: Garante espaçamento adequado entre conteúdo e propagandas
- **Props**: `topMargin`, `bottomMargin`, `className`

#### GoogleHorizontalAd
- **Arquivo**: `src/app/components/adsComponents/GoogleHorizontalAd.tsx`
- **Funcionalidade**: Propaganda horizontal fixa
- **Uso**: Páginas secundárias

#### GoogleVerticalAd
- **Arquivo**: `src/app/components/adsComponents/GoogleVerticalAd.tsx`
- **Funcionalidade**: Propaganda vertical para sidebars
- **Uso**: Páginas com layout em colunas

#### AdSenseLoader
- **Arquivo**: `src/app/components/adsComponents/AdSenseLoader.tsx`
- **Funcionalidade**: Monitora o carregamento do script do AdSense
- **Uso**: Componente invisível no layout principal

### 3. Configuração Centralizada
- **Arquivo**: `src/app/config/adsense.ts`
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
1. Após a seção de boas-vindas
2. No final da página

### Página de Geração (`/generate`)
1. Após o formulário (etapa formulário) - 40px top margin
2. Antes da grade de álbuns (etapa resultado) - 20px margins
3. Após a grade de álbuns (etapa resultado) - 20px margins

### Página Sobre (`/sobre`)
1. Após a primeira seção de conteúdo
2. No final da página

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

## Troubleshooting

### Propagandas não aparecem
1. Verificar se o script está carregando no console (procure por "✅ AdSense script loaded successfully")
2. Confirmar se o site está aprovado no AdSense
3. Verificar se não há bloqueadores de propaganda ativos
4. Verificar mensagens de erro no console

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

## Próximos Passos

1. **Monitoramento**: Implementar analytics para performance das propagandas
2. **A/B Testing**: Testar diferentes posicionamentos
3. **Otimização**: Ajustar baseado em métricas de CTR
4. **Novos Formatos**: Implementar propagandas in-article e sticky

## Contato
Para dúvidas sobre a implementação do AdSense, consulte a documentação oficial do Google ou entre em contato com a equipe de desenvolvimento. 