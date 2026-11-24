# Recuperação e exportação de capas

**Status:** Pronto para reteste
**Data:** 2026-11-23
**Branch:** fix/album-art-loading-export

## Diagnóstico confirmado

- A API acessa `image[3]` sem validar o contrato e transforma erros de metadados em listas vazias.
- A grade usa imagens externas sem recuperação. O download repete o carregamento, depende de CORS e troca qualquer falha por fallback.
- O proxy busca destinos arbitrários, sem limites, validação de conteúdo ou proteção de redirecionamentos.

## Plano e regressões

Normalizar metadados e preservar ranking; proxy restrito com DNS fixado na conexão; resolução compartilhada com concorrência, tentativas limitadas, cancelamento e descarte; Canvas usa objetos decodificados. Cobrir contratos Last.fm, segurança e limites do proxy, recuperação/cache/cancelamento e exportação 3/4/5 com testes automatizados. Executar instalação pelo lockfile, TypeScript, testes, build e lint. Validar navegador se disponível.

## Known Risks

Serviços externos podem não ter capas. Não fazer busca aproximada por título. Cache e limites em memória são por instância serverless, sem garantia global. Não há merge, deploy ou commit autorizado.

## Bugs Encontrados

### Bug 1 — metadados frágeis

**Descricao:** acesso por índice fixo e erros do provedor confundidos com ranking vazio.
**Comportamento esperado:** preservar ranking, artista, álbum e reproduções; selecionar resoluções válidas pelo atributo size.
**Causa raiz:** ausência de validação estrutural, HTTP e dos erros Last.fm.
**Correcao aplicada:** normalização pura, URLSearchParams, validação dos parâmetros, timeout e limite de resposta, cache somente de envelopes válidos. Respostas vazias legítimas são distinguidas de erro.
**Teste criado/atualizado:** metadata.test.cjs e api.test.cjs.
**Validacao:** consulta real ao Last.fm e testes com respostas simuladas normais, vazias, malformadas e com erro.

### Bug 2 — capas quebradas e fallback prematuro

**Descricao:** grade sem recuperação e exportador fazendo uma segunda carga independente sujeita a CORS.
**Comportamento esperado:** recuperar a capa correta e usar exatamente o recurso validado no Canvas.
**Causa raiz:** dois carregadores independentes sem cache, tentativas ou validação por decodificação.
**Correcao aplicada:** CoverSession compartilhada pela grade e download, URLs Blob locais, decodificação real, backoff, alternativas seguras, estados e repetição manual. Download aguarda; fallback exige ação explícita; falha do fallback bloqueia arquivo inválido.
**Teste criado/atualizado:** resolver.test.cjs, export.test.cjs e browser.cjs.
**Validacao:** grades 3/4/5; rede temporária, timeout, 404, conteúdo inválido, decodificação, deduplicação, cancelamento, descarte, memória, fallback e Canvas. Nenhuma requisição adicional de capa na exportação, inclusive no teste real.

### Bug 3 — proxy irrestrito

**Descricao:** URL arbitrária era buscada sem controle.
**Causa raiz:** nenhuma autorização de destino, controle de DNS, status, conteúdo, tamanho ou timeout.
**Correcao aplicada:** allowlist exata de CDN Last.fm, HTTPS, caminhos de capas, sem credenciais/query/fragmento; resolução IPv4 pública e IP fixado no lookup da conexão HTTPS mantendo verificação TLS. Cada redirecionamento é revalidado e resolve novamente; IPv6 não é utilizado. Limites de corpo, tempo e concorrência. Sem encaminhamento de cookies ou cabeçalhos do usuário.
**Teste criado/atualizado:** proxy.test.cjs, incluindo DNS privado e simulação de rebinding após validação.
**Validacao:** testes de URLs enganosas, destinos locais/metadata, redirecionamentos, MIME/assinatura, erro HTTP, arquivo grande, cancelamento, timeout e cache; transporte real HTTP 200 de uma capa Last.fm.

## Arquitetura e arquivos

1. `src/app/api/collage/route.ts` recebe username/período/limite e chama `src/lib/covers/lastfm.server.ts`.
2. `metadata.ts` normaliza e entrega imagem preferida, demais resoluções e MBID válido, mantendo ranking. `urls.ts` centraliza os destinos autorizados, incluindo o host atual observado `lastfm-img.freetls.fastly.net` e o host legado.
3. `useCovers.ts` cria uma `CoverSession` (`resolver.ts`) para o resultado. Quatro álbuns são processados por vez; a mesma URL compartilha a mesma Promise.
4. As imagens passam pelo `src/app/api/image-proxy/route.ts` / `proxy.server.ts`, sem recompressão, e são recebidas como Blob e decodificadas antes de ficarem disponíveis.
5. Falha da URL original leva às demais resoluções. Apenas após falharem é consultado `src/app/api/album-art/route.ts` (`album.getInfo`). Artista e título devem corresponder exatamente após normalização de caixa/espaço/NFC; MBID solicitado também deve corresponder. Autocorreção desativada; nenhuma busca aproximada.
6. `AlbumGrid.tsx` mostra o Blob validado, indicador com dimensões estáveis e repetição manual. `generate/page.tsx` acompanha pendências e solicita confirmação de fallback. `CollageSection.tsx` agora usa Album tipado.
7. `export.ts` recebe os mesmos HTMLImageElement decodificados, desenha 300×300 por capa e preserva ordem, informações, reproduções, nome do arquivo e modal de apoio. Erros de Canvas/arquivo viram mensagem acessível.
8. `page.module.css` contém apenas os indicadores/ações novos. As três traduções foram ampliadas. `next.config.ts` foi revisado e preservado: remotePatterns do next/image não controla img/fetch/Canvas.
9. `package.json`, `tsconfig.test.json`, `tests/*.test.cjs` e `.gitignore` adicionam testes com TypeScript e node:test, sem dependências novas. `tests/browser.cjs` é uma suíte opcional com Playwright externo.

## Limites, cache e diagnóstico

- Até três tentativas para rede/timeout/408/425/429/5xx; backoff de 300/600 ms com jitter até 150 ms. Erros permanentes, MIME e decodificação passam à próxima fonte.
- Timeout por tentativa: 8 s no cliente; orçamento de recuperação por álbum: 35 s após sair da fila; fallback tem orçamento separado de 8 s. Esses limites podem interromper alternativas antes de testar todas as resoluções; o usuário pode repetir manualmente.
- Proxy: 7 s totais, até dois redirecionamentos, 5 MiB e 12 cargas simultâneas por instância. Apenas PNG/JPEG/WebP/GIF com MIME e assinatura compatíveis. Respostas de erro usam no-store; imagens aceitas usam max-age=3600 e s-maxage=86400. A validação final de decodificação ocorre no cliente; HTTP 200 sozinho não gera um recurso válido no cache do cliente.
- Metadados: 6 s, 1 MiB, quatro chamadas por instância; cache de sucesso com TTL de 120 s, até 100 entradas e deduplicação simultânea. A ausência de consumidor não cancela uma chamada de metadados compartilhada; ela termina dentro do timeout e pode alimentar o cache.
- Imagens no cliente: cache durante a sessão com validade de 10 minutos para novas buscas; falhas são removidas. URLs são revogadas no descarte e nas falhas de decodificação/preview. Capas acima de quatro milhões de pixels são recusadas; orçamento estimado de imagens decodificadas de 80 MiB mais reserva para fallback, até 96 MiB. Isso não representa um limite absoluto do heap do navegador, que também armazena Blobs e buffers temporários.
- Estados: loading, retrying, loaded, failed e fallback. Logs contêm códigos e índices, sem URLs de API, chaves ou payloads sensíveis. Rede, timeout, HTTP de origem/proxy, metadados, conteúdo, decodificação, tentativas esgotadas, fallback e exportação são distinguíveis. CORS externo é evitado pelo fluxo same-origin; SecurityError do Canvas é registrado como canvas_cors quando identificável.

## Automated Checks

- `npm ci`: concluído usando o package-lock existente; nenhuma dependência adicionada e lockfile preservado.
- `npm test`: **38 testes passaram**, cobrindo metadados/API, proxy/DNS, carregador e exportação.
- `npm run typecheck`: passou.
- `npm run build`: passou com Next.js 15.3.8; repetir após qualquer edição de código.
- `npm run lint`: não fornece uma verificação automatizada no estado atual; abre o assistente de configuração do ESLint, ausente no repositório. Nenhuma configuração criada para evitar ampliar o escopo.
- `git diff --check`: sem erros de whitespace (Git emite avisos de conversão LF/CRLF).
- `npm audit`: sete vulnerabilidades preexistentes — uma moderada, cinco altas e uma crítica (Next.js). Pacotes: browserslist, nanoid, next, postcss, sharp, source-map-js e yaml. Não introduzidas por este fix; atualização de dependências ficou fora do escopo. A instalação também informou scripts de sharp e speed-insights ainda não aprovados na política do npm; o build concluiu.
- Chrome headless local, build de produção, oito cenários com APIs/imagens simuladas: 3x3 normal com opções de informação/reprodução; 4x4 com falha de rede seguida de sucesso; 5x5 mobile; download aguardando capa pendente; indisponibilidade permanente mobile com confirmação; imagem 200 corrompida recuperada por alternativa; fallback local ausente; falha de Canvas. Verificações de dimensões PNG, cores/ordem, nome do arquivo, ausência de imagens quebradas, modal, overflow horizontal e nenhuma nova requisição de capa no download.
- Teste real local com perfil público RJ e chave existente no servidor: nove capas, nenhum fallback, nove requisições ao proxy e **zero requisições de capas durante a exportação**. Last.fm e transporte HTTPS/IP fixado também testados diretamente. Nenhum teste ou alteração em produção.

## Browser QA reproduzível

Depois do build, iniciar `npm run start -- --hostname 127.0.0.1 --port 3100` e executar `node tests/browser.cjs` com Playwright disponível. Na execução desta tarefa foi usado Playwright temporário do cache npm e Chrome instalado, sem alterar dependências/lockfile. A variável `PLAYWRIGHT_MODULE` pode apontar para uma instalação externa; `TEST_BROWSER_CHANNEL` permite escolher o navegador e `TEST_BASE_URL` muda a origem. Capturas e PNGs ficam em `.test-artifacts/` (ignorado pelo Git).

## Manual QA Checklist

- [ ] Retestar com o próprio usuário Last.fm em 3x3, 4x4 e 5x5 e nos períodos usados habitualmente.
- [ ] Conferir informação/artista e reproduções no PNG e o modal de apoio.
- [ ] Simular rede lenta/offline; observar recuperação e aguardo no download.
- [ ] Conferir mensagem e repetição de capa definitivamente indisponível; autorizar fallback explicitamente.
- [ ] Conferir mobile e navegação de retorno; nenhuma chave deve aparecer no cliente/logs.

## Limitações e reteste

- Não foi integrada busca MusicBrainz/Cover Art Archive: o MBID de album no retorno Last.fm não traz a entidade tipada release/release-group necessária para escolher seguramente o endpoint; buscar por semelhança poderia trocar o álbum. A estratégia segura é Last.fm original, resoluções alternativas e getInfo estrito. A API CAA documenta endpoints distintos por entidade e redirecionamentos para armazenamento externo: https://musicbrainz.org/doc/Cover_Art_Archive/API.
- Não há garantias de disponibilidade de capas/Last.fm nem recuperação de 100% dos casos. Mudanças futuras dos hosts/caminhos CDN exigem revisar a allowlist.
- Há limite e cache local por instância; limitar tráfego agregado entre instâncias requer controles na plataforma/CDN. Este fix não adiciona configuração de produção.
- Transporte usa runtime Node.js e IPv4, não Edge. Hosts sem IPv4 falham de modo seguro.
- Chrome foi validado localmente; Safari/Firefox e produção não foram testados. Anúncios externos foram bloqueados nos testes de navegador, sem alterar código de anúncios.
- As opções de arquivo mantêm a data UTC original usada no nome. O relatório usa a data local informada, 2026-11-23.
- Branch preservada: fix/album-art-loading-export, HEAD inicial 1f8e6b2. Fetch por SSH sem chave falhou; fetch HTTPS confirmou a branch existente. Alterações permanecem sem commit; nenhum push, merge ou deploy executado.
