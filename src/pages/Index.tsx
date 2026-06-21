import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const HERO = 'https://cdn.poehali.dev/projects/1b7c7e35-66d3-4d53-860a-4d5b8046d25b/files/8c89cdf4-e661-42e3-ad67-562bb99f6702.jpg';

const GALLERY = [
  {
    src: 'https://cdn.poehali.dev/projects/1b7c7e35-66d3-4d53-860a-4d5b8046d25b/files/1e7d1fa4-2ff4-4246-95a1-b85119c07d15.jpg',
    title: 'Русская баня',
    tag: 'Баня',
  },
  {
    src: 'https://cdn.poehali.dev/projects/1b7c7e35-66d3-4d53-860a-4d5b8046d25b/files/07247ed6-c993-45f4-a252-42cecd402bdd.jpg',
    title: 'Уютные домики',
    tag: 'Помещения',
  },
  {
    src: 'https://cdn.poehali.dev/projects/1b7c7e35-66d3-4d53-860a-4d5b8046d25b/files/6a23324d-cf6c-482c-8274-ff6c831d9d83.jpg',
    title: 'Терраса и купель',
    tag: 'Территория',
  },
  {
    src: HERO,
    title: 'Лесная заимка',
    tag: 'Территория',
  },
];

const FEATURES = [
  { icon: 'Flame', title: 'Топим на дровах', text: 'Настоящая русская баня с берёзовыми вениками и парной.' },
  { icon: 'Trees', title: 'Сосновый лес', text: 'Полная тишина, чистый воздух и природа вокруг.' },
  { icon: 'Home', title: 'Тёплые домики', text: 'Дерево, лён и уют — отдых для души и тела.' },
];

const Index = () => {
  const [active, setActive] = useState<number | null>(null);
  const [filter, setFilter] = useState('Все');
  const tags = ['Все', 'Помещения', 'Баня', 'Территория'];
  const filtered = filter === 'Все' ? GALLERY : GALLERY.filter((g) => g.tag === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="container mx-auto flex items-center justify-between py-6">
          <a href="#" className="flex items-center gap-2 text-background">
            <Icon name="Flame" size={26} className="text-accent" />
            <span className="font-display text-2xl font-semibold tracking-wide">Банная заимка</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-background/90">
            <a href="#gallery" className="hover:text-accent transition-colors">Галерея</a>
            <a href="#booking" className="hover:text-accent transition-colors">Бронирование</a>
            <a href="#contacts" className="hover:text-accent transition-colors">Контакты</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative h-[100svh] flex items-end overflow-hidden">
        <img src={HERO} alt="Банная заимка" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#241a12]/90 via-[#241a12]/30 to-[#241a12]/50" />
        <div className="grain absolute inset-0 opacity-20 mix-blend-overlay" />
        <div className="container mx-auto relative z-10 pb-20 md:pb-28">
          <p className="animate-fade-in text-accent uppercase tracking-[0.3em] text-xs md:text-sm mb-5">
            База отдыха · Лес · Тишина
          </p>
          <h1 className="animate-fade-in text-background font-display text-5xl md:text-8xl leading-[0.95] font-semibold max-w-4xl" style={{ animationDelay: '0.1s' }}>
            Отдых в лесу,<br />где топится баня
          </h1>
          <p className="animate-fade-in text-background/80 text-lg md:text-xl mt-6 max-w-xl" style={{ animationDelay: '0.2s' }}>
            Уютные деревянные домики, настоящая русская парная и природа вдали от городской суеты.
          </p>
          <div className="animate-fade-in flex flex-wrap gap-4 mt-9" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-13 text-base">
              <a href="#booking"><Icon name="CalendarDays" size={18} className="mr-2" />Забронировать</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-background/40 text-background bg-transparent hover:bg-background hover:text-foreground">
              <a href="#gallery">Смотреть фото</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto py-20 md:py-28">
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card rounded-2xl p-8 border border-border/60 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center mb-5">
                <Icon name={f.icon} size={26} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3">Галерея</p>
              <h2 className="font-display text-4xl md:text-6xl font-semibold">Загляните внутрь</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-5 py-2 rounded-full text-sm transition-colors border ${
                    filter === t
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'border-primary-foreground/30 text-primary-foreground/80 hover:border-accent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, i) => (
              <button
                key={item.title + i}
                onClick={() => setActive(GALLERY.indexOf(item))}
                className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${i === 0 ? 'h-72 lg:h-full' : 'h-72'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241a12]/85 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute left-5 bottom-5 text-left">
                  <span className="text-accent text-xs uppercase tracking-widest">{item.tag}</span>
                  <p className="font-display text-2xl font-semibold text-background">{item.title}</p>
                </div>
                <div className="absolute right-4 top-4 w-9 h-9 rounded-full bg-background/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="Maximize2" size={16} className="text-background" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="container mx-auto py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3">Бронирование</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold mb-5">Выберите свои дни</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Укажите даты заезда и выезда — мы свяжемся с вами, подтвердим бронь и подготовим баню к вашему приезду.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'Users', text: 'До 8 гостей в большом доме' },
                { icon: 'Clock', text: 'Заезд с 14:00, выезд до 12:00' },
                { icon: 'Sparkles', text: 'Баня входит в стоимость суток' },
              ].map((r) => (
                <div key={r.text} className="flex items-center gap-3">
                  <Icon name={r.icon} size={20} className="text-secondary" />
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/60 shadow-sm">
            <h3 className="font-display text-2xl font-semibold mb-6">Заявка на бронь</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <label className="text-sm">
                <span className="text-muted-foreground">Дата заезда</span>
                <Input type="date" className="mt-1.5 bg-background" />
              </label>
              <label className="text-sm">
                <span className="text-muted-foreground">Дата выезда</span>
                <Input type="date" className="mt-1.5 bg-background" />
              </label>
            </div>
            <Input placeholder="Ваше имя" className="mb-4 bg-background h-12" />
            <Input placeholder="Телефон" className="mb-6 bg-background h-12" />
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-13 text-base">
              Отправить заявку
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Нажимая кнопку, вы соглашаетесь с обработкой данных.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-accent uppercase tracking-[0.3em] text-xs mb-3">Контакты</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold mb-8">Как нас найти</h2>
            <div className="space-y-6">
              {[
                { icon: 'MapPin', label: 'Адрес', value: 'Ленинградская обл., д. Заречье, лесной массив' },
                { icon: 'Phone', label: 'Телефон', value: '+7 (900) 123-45-67' },
                { icon: 'Mail', label: 'Почта', value: 'hello@bannaya-zaimka.ru' },
                { icon: 'Clock', label: 'Приём гостей', value: 'Ежедневно, 09:00 — 21:00' },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <Icon name={c.icon} size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-primary-foreground/60 text-sm">{c.label}</p>
                    <p className="text-lg">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-9">
              {['Send', 'MessageCircle', 'Instagram'].map((s) => (
                <a key={s} href="#" className="w-11 h-11 rounded-full border border-primary-foreground/30 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors">
                  <Icon name={s} size={18} />
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden min-h-[320px] border border-primary-foreground/20">
            <iframe
              title="Карта"
              src="https://yandex.ru/map-widget/v1/?ll=30.5%2C59.9&z=9"
              className="w-full h-full min-h-[320px] grayscale"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1d150e] text-background/70 py-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Flame" size={20} className="text-accent" />
            <span className="font-display text-lg text-background">Банная заимка</span>
          </div>
          <p>© 2026 Банная заимка. Все права защищены.</p>
        </div>
      </footer>

      {/* LIGHTBOX */}
      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent">
          {active !== null && (
            <div className="relative">
              <img src={GALLERY[active].src} alt={GALLERY[active].title} className="w-full rounded-lg" />
              <div className="absolute left-6 bottom-6">
                <span className="text-accent text-xs uppercase tracking-widest">{GALLERY[active].tag}</span>
                <p className="font-display text-3xl font-semibold text-background">{GALLERY[active].title}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
