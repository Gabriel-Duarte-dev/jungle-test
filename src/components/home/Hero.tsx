import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { NftImage } from '@/components/artwork/NftImage'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { PAGE } from '@/lib/layout'
import { useFeaturedQuery } from '@/services/nfts/nfts.queries'

export function Hero() {
  const { data, isLoading } = useFeaturedQuery()
  const hero = data?.hero
  const secondary = data?.limitedOffer

  return (
    <>
      <section className="px-6 pt-2 lg:hidden">
        <div className="bg-surface-card relative overflow-hidden rounded-2xl px-4 py-3">
          <div className="bg-primary/30 pointer-events-none absolute -top-8 -left-18 size-62 rounded-full" />
          <div className="bg-primary/20 pointer-events-none absolute -top-4 left-25 size-62 rounded-full" />
          <div className="relative flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-caption tracking-wordmark text-foreground font-medium">
                Bem-vindo à Kurio
              </p>
              <h1 className="text-foreground mt-1 text-[18px] leading-7 font-bold md:text-[22px]">
                SEJA DONO DA
                <br />
                CULTURA DIGITAL
              </h1>
              <p className="text-caption text-text-secondary mt-2 leading-4.5">
                Descubra NFTs selecionados de criadores do mundo todo.
              </p>
              <a
                href="#catalogo"
                className="text-caption text-text-accent mt-3 inline-flex items-center gap-1.5 font-bold tracking-wide uppercase"
              >
                Explorar
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
            <div className="relative h-36.5 w-34.5 shrink-0">
              {isLoading || !hero ? (
                <Skeleton className="size-34.5 rounded-xl" />
              ) : (
                <Link
                  to="/nfts/$nftId"
                  params={{ nftId: hero.id }}
                  className="absolute top-0 left-0 block size-34.5 overflow-hidden rounded-xl"
                >
                  <NftImage
                    artwork={hero.artwork}
                    width={160}
                    height={160}
                    sizes="138px"
                    priority
                  />
                </Link>
              )}
              {secondary && (
                <Link
                  to="/nfts/$nftId"
                  params={{ nftId: secondary.id }}
                  className="absolute bottom-0 left-3.5 block size-14.5 overflow-hidden rounded-lg"
                >
                  <NftImage artwork={secondary.artwork} width={160} height={160} sizes="58px" />
                </Link>
              )}
            </div>
          </div>
          <div className="relative mt-2 flex justify-center gap-1.5" aria-hidden>
            <span className="bg-primary size-1.5 rounded-full" />
            <span className="bg-foreground/25 size-1.5 rounded-full" />
            <span className="bg-foreground/25 size-1.5 rounded-full" />
          </div>
        </div>
      </section>

      <section className={`hidden lg:block ${PAGE} py-8`}>
        <div className="flex h-[450px] items-center justify-between">
          <div className="flex w-full max-w-[557px] min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-body tracking-wordmark text-foreground font-medium">
                Bem-vindo à Kurio
              </p>
              <h1 className="text-display text-foreground font-bold">
                SEJA DONO DO FUTURO
                <br />
                DA ARTE DIGITAL
              </h1>
              <p className="text-body text-text-secondary mt-1 max-w-[557px] leading-6">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e tenha uma parte da cultura da internet.
              </p>
            </div>
            <Button asChild className="h-10 w-35 uppercase">
              <a href="#catalogo">Explorar</a>
            </Button>
            <img src="/assets/decor/hero-dots.svg" alt="" width={40} height={8} />
          </div>

          {isLoading || !hero ? (
            <Skeleton className="size-[450px] shrink-0 rounded-3xl" />
          ) : (
            <Link to="/nfts/$nftId" params={{ nftId: hero.id }} className="block shrink-0">
              <NftImage
                artwork={hero.artwork}
                width={450}
                height={450}
                sizes="450px"
                priority
                className="size-[450px] rounded-3xl"
              />
            </Link>
          )}
        </div>
      </section>
    </>
  )
}
