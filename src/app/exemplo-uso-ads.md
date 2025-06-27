# Exemplo de Uso dos Novos Componentes de Propaganda

## Como usar os novos slots de propaganda

### 1. GoogleResponsiveAd (Slot Original - Horizontal)
```tsx
import GoogleResponsiveAd from './components/adsComponents/GoogleResponsiveAd';

// Uso básico
<GoogleResponsiveAd />

// Posicionamento: Após seções de conteúdo
<div className="content-section">
  <h2>Título da Seção</h2>
  <p>Conteúdo da seção...</p>
</div>
<GoogleResponsiveAd />
```

### 2. GoogleMultiplexAd (Novo Slot - Multiplex)
```tsx
import GoogleMultiplexAd from './components/adsComponents/GoogleMultiplexAd';

// Uso em páginas com conteúdo extenso
<div className="long-content">
  <h2>Seção 1</h2>
  <p>Conteúdo extenso...</p>
  
  <GoogleMultiplexAd />
  
  <h2>Seção 2</h2>
  <p>Mais conteúdo...</p>
</div>
```

### 3. GoogleArticleAd (Novo Slot - In-Article)
```tsx
import GoogleArticleAd from './components/adsComponents/GoogleArticleAd';

// Uso dentro de artigos ou conteúdo textual
<article className="blog-post">
  <h1>Título do Artigo</h1>
  
  <p>Primeiro parágrafo...</p>
  <p>Segundo parágrafo...</p>
  
  <GoogleArticleAd />
  
  <p>Terceiro parágrafo...</p>
  <p>Quarto parágrafo...</p>
</article>
```

## Exemplo de Implementação Completa

```tsx
'use client'
import { useRouter } from 'next/navigation';
import GoogleResponsiveAd from './components/adsComponents/GoogleResponsiveAd';
import GoogleMultiplexAd from './components/adsComponents/GoogleMultiplexAd';
import GoogleArticleAd from './components/adsComponents/GoogleArticleAd';

export default function ExemploPage() {
  const router = useRouter();

  return (
    <main className="container">
      {/* Seção de boas-vindas */}
      <section className="welcome">
        <h1>Bem-vindo</h1>
        <p>Conteúdo de boas-vindas...</p>
      </section>

      {/* Propaganda responsiva após boas-vindas */}
      <GoogleResponsiveAd />

      {/* Seção com conteúdo extenso */}
      <section className="content">
        <h2>Seção de Conteúdo</h2>
        <p>Conteúdo extenso...</p>
        
        {/* Propaganda multiplex no meio do conteúdo */}
        <GoogleMultiplexAd />
        
        <p>Mais conteúdo...</p>
      </section>

      {/* Artigo ou conteúdo textual */}
      <article className="article">
        <h2>Título do Artigo</h2>
        <p>Primeiro parágrafo...</p>
        <p>Segundo parágrafo...</p>
        
        {/* Propaganda in-article */}
        <GoogleArticleAd />
        
        <p>Terceiro parágrafo...</p>
        <p>Quarto parágrafo...</p>
      </article>

      {/* Propaganda responsiva no final */}
      <GoogleResponsiveAd />
    </main>
  );
}
```

## Configurações dos Slots

### Slot Original (3404072661)
- **Formato**: `auto` com `data-full-width-responsive="true"`
- **Uso**: Propagandas responsivas gerais
- **Melhor para**: Posicionamento após seções de conteúdo

### Slot Multiplex (9969481018)
- **Formato**: `autorelaxed`
- **Uso**: Páginas com conteúdo extenso
- **Melhor para**: Meio de conteúdo longo

### Slot Article (6493270436)
- **Formato**: `fluid` com `data-ad-layout="in-article"`
- **Uso**: Dentro de artigos e conteúdo textual
- **Melhor para**: Integração natural com texto

## Dicas de Posicionamento

### 1. Não sobrecarregue
- Máximo 3 propagandas por página
- Espaçamento adequado entre propagandas
- Não coloque propagandas muito próximas

### 2. Posicionamento estratégico
- Após seções de conteúdo importantes
- No meio de conteúdo extenso
- No final da página
- Dentro de artigos (apenas o slot article)

### 3. Experiência do usuário
- Não interrompa o fluxo de leitura
- Mantenha o layout responsivo
- Use o componente AdWrapper para espaçamento consistente

## Monitoramento

### Console Logs
- `✅ AdSense script loaded successfully` - Script carregado
- `✅ Ad loaded successfully` - Propaganda carregada
- `✅ Multiplex Ad loaded successfully` - Multiplex carregado
- `✅ Article Ad loaded successfully` - Article carregado

### Tratamento de Erros
- Mensagens de erro amigáveis
- Fallbacks para casos de falha
- Logs detalhados no console

## Performance

### Otimizações
- Carregamento não-bloqueante
- Delay de 1 segundo para garantir carregamento
- Verificação de disponibilidade do script
- Timeout de 10 segundos

### Monitoramento
- Core Web Vitals
- Métricas de CTR
- Performance das propagandas
- Experiência do usuário 