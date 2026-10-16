---
title: VirtualBox ile Ubuntu 24.04.4 LTS Kurulumu — Adım Adım Rehber
shortTitle: Kurulum
description: Windows 11 üzerinde Ubuntu 24.04.4 kurulumu; ISO doğrulaması, sanal makine ayarları ve gerçek vmwgfx grafik hatası deneyimi.
topic: ubuntu
order: 1
category: devops
date: 2026-10-16
draft: false
---

## Neden Ubuntu kurdum?

Linux'u yalnızca terminal komutları ezberleyerek değil, gerçek bir işletim sistemi üzerinde deneyerek öğrenmek istedim. Amacım dosya sistemini anlamak, terminal kullanmak ve zamanla Docker, Nginx ve sunucu yönetimine geçmekti. Windows'u kaldırmak istemediğim için VirtualBox ile ayrı bir sanal bilgisayar oluşturdum.

Bu rehber Windows 11, Oracle VirtualBox 7.2.20 ve Ubuntu Desktop 24.04.4 LTS ile yaptığım kuruluma dayanıyor. Başarısız denemeler de sürecin parçası: görüntü belleğini artırmak ve Safe Graphics benim ortamımda sorunu çözmedi; grafik denetleyicisini değiştirmek kurulum ekranına ulaşmamı sağladı. Bu sonucu bütün bilgisayarlar için garanti olarak düşünmemek gerekir.

## VirtualBox ve sanal makine nedir?

VirtualBox, fiziksel bilgisayarın kaynaklarını kullanarak sanal makineler oluşturur. Windows ana sistem (host), Ubuntu ise misafir sistem (guest) olarak çalışır. Sanal makinenin ayrı bir diski ve işletim sistemi vardır; işlemci, RAM ve depolama kaynaklarını ana bilgisayarla paylaşır.

```text
Fiziksel bilgisayar
├── Windows 11
└── Oracle VirtualBox
    └── Ubuntu 24.04.4 LTS
        ├── 4096 MB RAM
        ├── 4 vCPU
        └── 40 GB sanal disk
```

## Kullandığım donanım ve sanal makine ayarları

| Fiziksel donanım | Kurulum ortamım |
| --- | --- |
| İşlemci | AMD Ryzen 7 5800H |
| RAM | 16 GB |
| Depolama | NVMe SSD |
| Kurulum öncesi boş alan | 258 GB |
| Ana işletim sistemi | Windows 11 |

| Sanal makine kaynağı | Seçtiğim değer |
| --- | --- |
| Bellek | 4096 MB |
| İşlemci | 4 vCPU |
| Sanal disk | 40 GB, dinamik büyüyen |
| Görüntü belleği | İlk denemede 16 MB, sonrasında 128 MB |
| Grafik denetleyicisi | İlk denemede VMSVGA, çalışan denemede VBoxSVGA |
| Ağ | NAT |

Bu değerler zorunlu sistem gereksinimleri veya performans ölçümü değildir; benim kurulum ayarlarımdır. Kaynak ayırmadan önce Windows'un mevcut bellek kullanımını kontrol et. Dört vCPU seçmek, dört fiziksel çekirdeğin kalıcı olarak yalnızca Ubuntu'ya ayrıldığı anlamına gelmez. Dinamik disk de büyüdükçe fiziksel depolama tüketir; 40 GB üst sınırını baştan tamamen doldurmaz.

## VirtualBox kurulumu

[Resmî indirme sayfasında](https://www.virtualbox.org/wiki/Downloads) **Windows hosts** paketini seçtim. İlk etapta Extension Pack indirmiştim; bunun ana uygulama olmadığını öğrendim. Extension Pack ek özellikler sunan ayrı bir bileşendir ve bu temel kurulum için gerekli değildi.

Windows kurulum dosyasını çalıştırıp ağ bağdaştırıcısı yükleme izinlerini onayladım. Ağ bileşenleri kurulurken bağlantı kısa süreli kesilebilir. Kurulum tamamlandığında VirtualBox Manager açıldı. Bu deneyimdeki sürüm için [7.2.20 arşivi](https://download.virtualbox.org/virtualbox/7.2.20/) kullanılabilir.

## Ubuntu ISO dosyasını indirme

[Ubuntu sürüm sayfasından](https://releases.ubuntu.com/24.04/) indirdiğim dosya şuydu:

```text
ubuntu-24.04.4-desktop-amd64.iso
```

Dosya yaklaşık 6,2 GB büyüklüğündeydi. `amd64`, yalnızca AMD markasını değil, Intel ve AMD işlemcilerde yaygın olan 64 bit x86 mimarisini ifade eder. ISO, kurulum ortamını içeren bir disk imajıdır; VirtualBox bunu sanal DVD sürücüsünden başlatır.

Sürüm sayfası zamanla daha yeni 24.04 nokta sürümlerini sunabilir. Bu rehberde anlatılan deneyim 24.04.4'e aittir; farklı ISO indirirsen dosya adını ve doğrulama kaydını ona göre seç.

## SHA-256 ile dosya doğrulaması

Windows'ta ISO'nun bulunduğu İndirilenler klasöründe **PowerShell** açıp çalıştırdım:

```powershell
Get-FileHash .\ubuntu-24.04.4-desktop-amd64.iso -Algorithm SHA256
```

`Get-FileHash` dosyanın özetini hesaplar; `-Algorithm SHA256` kullanılan algoritmayı seçer. Dosya başka klasördeyse tam yolunu tırnak içinde yazmalısın.

[Resmî SHA256SUMS listesindeki](https://releases.ubuntu.com/24.04/SHA256SUMS) aynı dosyaya ait kayıt:

```text
3a4c9877b483ab46d7c3fbe165a0db275e1ae3cfe56a5657e5a47c2f99a99d1e
```

Kendi hesapladığım değer bu kayıtla eşleşti. Buradaki değer ISO'ya ait doğrulama kaydıdır; terminal çıktısının tamamının kopyası değildir. Başka bir sürümün özetini karşılaştırmak doğru sonuç vermez.

SHA-256 eşleşmesi dosyanın beklenen içerikle aynı olduğunu kontrol eder. Kontrol listesinin kaynağı da güvenilir olmalıdır. Listenin imzasını doğrulamak için Ubuntu'nun [indirme doğrulama rehberindeki](https://ubuntu.com/tutorials/how-to-verify-ubuntu) `SHA256SUMS.gpg` adımlarına bakabilirsin.

## Sanal makine oluşturma

VirtualBox Manager'da **Yeni** seçeneğine tıkladım. Makine adını `Ubuntu-24.04-Lab` olarak belirleyip ISO dosyasını seçtim. İşletim sistemi türünü Ubuntu 24.04 (64-bit) olarak kontrol ettim. Kurulum ekranlarını kendim görmek istediğim için **katılımsız kurulumu devre dışı bıraktım**.

Ardından 4096 MB RAM, 4 vCPU ve 40 GB dinamik sanal disk ayarladım. NAT ağ ayarını korudum. NAT, Ubuntu'nun ana bilgisayarın bağlantısı üzerinden internete çıkmasına yardımcı olur; dışarıdan misafir sisteme bağlantı almak ek ayarlar gerektirebilir.

Makineyi başlattığımda GRUB menüsünde **Try or Install Ubuntu** seçeneğini kullandım.

## İlk başlatmada vmwgfx grafik hatası

Kurulum arayüzü açılmadı; siyah ekranda bekledikten sonra şu mesajla karşılaştım:

```error
vmwgfx seems to be running on an unsupported hypervisor.
This configuration is likely broken.
Please switch to a supported graphics device.
```

`vmwgfx`, Linux'ta VMware SVGA türü sanal grafik aygıtlarıyla ilişkili sürücüdür. Hypervisor ise sanal makineleri çalıştıran katmandır. Benim ortamımda denetleyici VMSVGA idi. Bu mesaj grafik uyumluluğuna ilişkin bir ipucuydu; tek başına bütün siyah ekranların nedenini veya kesin çözümünü kanıtlamaz.

### İlk deneme: görüntü belleğini artırmak

Sanal makineyi tamamen kapatıp Ekran ayarlarındaki görüntü belleğini 16 MB'den 128 MB'ye yükselttim. Yeniden başlattığımda hata devam etti. Belleği artırmak tek başına çözüm olmadı.

Donanım ayarlarını değiştirmeden önce makinenin **güç kapalı** durumda olması gerekir. Kaydedilmiş durum, tamamen kapatılmış olmakla aynı değildir.

### İkinci deneme: Safe Graphics

GRUB menüsündeki **Ubuntu (safe graphics)** seçeneğini denedim. Bir noktada bildirim sesi duymama rağmen görüntü siyah kaldı ve kurulum arayüzü açılmadı. Bu seçenek de benim denememde sorunu çözmedi.

### Çalışan deneme: VBoxSVGA

Makineyi tamamen kapattım. Grafik denetleyicisini arayüzden değiştiremediğim için Windows üzerindeki `VBoxManage` aracını kullandım.

**Windows CMD** için kullandığım komut:

```console
"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm "Ubuntu-24.04-Lab" --graphicscontroller vboxsvga
```

Aynı işlemin **PowerShell** karşılığı:

```powershell
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm "Ubuntu-24.04-Lab" --graphicscontroller vboxsvga
```

`modifyvm` makine yapılandırmasını değiştirir; `--graphicscontroller vboxsvga` grafik denetleyicisini seçer. VirtualBox farklı yere kuruluysa program yolunu, makine adı farklıysa tırnak içindeki adı değiştir. Bu komutlar Ubuntu terminalinde değil, Windows'ta çalıştırılır.

### CMD ve PowerShell farkı

İlk denememde PowerShell'deki `&` çağırma operatörünü CMD'ye yazmıştım ve şu hatayı aldım:

```error
& was unexpected at this time.
```

Sorun VirtualBox değildi; komut yanlış kabuk sözdizimiyle yazılmıştı. CMD'de baştaki `&` işaretini kaldırınca komut çalıştı.

### Değişikliği doğrulama

CMD üzerinde denetleyiciyi kontrol ettim:

```console
"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" showvminfo "Ubuntu-24.04-Lab" | findstr /i "Graphics"
```

PowerShell kullanıyorsan aynı komutun başına çağırma operatörü ekle:

```powershell
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" showvminfo "Ubuntu-24.04-Lab" | Select-String "Graphics"
```

Benim gördüğüm bilgi:

```output
Graphics Controller: VBoxSVGA
```

Yeniden başlatınca Ubuntu logosu göründü ve kurulum arayüzü açıldı. Bu, benim makinemde işe yarayan sonuçtu.

## VMSVGA ve VBoxSVGA farkı

VMSVGA Linux misafirler için varsayılan grafik denetleyicisidir; VBoxSVGA ise Windows misafirler için kullanılan bir seçenektir. VBoxSVGA'ya geçişi bütün Linux kurulumları için genel öneri olarak görmemek gerekir. Burada belgelenen, belirli bir ortamda kurulum arayüzüne ulaşmak için yaptığım değişikliktir.

Grafik denetleyicileri ve misafir işletim sistemi desteği için [Oracle VirtualBox 7.2.20 kullanım kılavuzunun](https://download.virtualbox.org/virtualbox/7.2.20/UserManual.pdf) ekran ayarları bölümüne bakabilirsin. Çalışan ayarı değiştirmeden önce mevcut yapılandırmanı not et; sorun devam ederse VirtualBox sürümü, denetleyici ve hata mesajını birlikte değerlendir.

## Ubuntu kurulum ekranları

Grafik sorununu aştıktan sonra sihirbazda şu seçimlerle ilerledim:

| Ekran | Seçimim |
| --- | --- |
| Erişim kolaylıkları | Varsayılan |
| Ağ | Kablolu bağlantı |
| Kurulum aracı güncellemesi | Atla |
| Dene veya kur | Ubuntu'yu kur |
| Kurulum yöntemi | Interactive Installation |
| Uygulamalar | Öntanımlı kurulum |
| Üçüncü taraf sürücüler | Seçilmedi |
| Ek medya desteği | Seçilmedi |
| Disk yöntemi | Diski sil ve Ubuntu'yu kur |
| Saat dilimi | Europe/Istanbul |

### Hedef diski kontrol et

> [!DIKKAT]
> **Diski sil ve Ubuntu'yu kur**, seçilen hedef diskteki verileri siler. Benim hedefim VirtualBox içinde oluşturduğum 40 GB **VBOX HARDDISK** aygıtıydı. Fiziksel bilgisayarda aynı seçeneği kullanmak Windows verilerini silebilir. Son onaydan önce hedef aygıtı ve kapasitesini kontrol et.

Bu kurulumda `ext4` dosya sistemi kullanıldı. ext4, Linux sistemlerinde yaygın kullanılan bir dosya sistemidir. Sihirbazda kullanıcı hesabını ve parolanı belirleyip özet ekranındaki hedefi kontrol ettikten sonra kurulumu başlatabilirsin.

## Yeniden başlatma ve ISO'yu çıkarma

Kurulum sonunda yeniden başlatırken şu mesaj geldi:

```output
Please remove the installation medium, then press ENTER
```

VirtualBox'ın sanal optik sürücüsünün boş olduğunu doğrulayıp Enter'a bastım. Kurulum ekranına tekrar dönüyorsan sanal optik sürücüde ISO'nun bağlı kalıp kalmadığını kontrol et; oluşturduğun sanal sabit diski kaldırma.

Ubuntu masaüstü açıldı. İlk yapılandırmada Ubuntu Pro ve isteğe bağlı sistem verisi paylaşımını etkinleştirmeden ilerledim. Laboratuvar çalışmalarına 24.04 LTS üzerinde devam etmeyi seçtim.

## Terminal üzerinden kurulum doğrulaması

**Ctrl + Alt + T** ile terminal açtım:

```bash
lsb_release -a
```

Sürüm bilgisinde Ubuntu 24.04.4 LTS ve `noble` kod adını gördüm. Tam terminal dökümünü burada yeniden üretmiyorum.

Bulunduğum dizini görmek için çalıştırdım:

```bash
pwd
```

Kendi hesabımdaki çıktı:

```output
/home/cem
```

Senin kullanıcı adın farklıysa ev dizinin de farklı olur. Böylece masaüstünün açıldığını, terminalin çalıştığını ve kurulu dağıtımın sürümünü kontrol etmiş oldum; bu kontroller bir performans testi değildir.

## Sorunlar ve denemelerin sonucu

| Sorun | Deneme | Benim ortamımdaki sonuç |
| --- | --- | --- |
| Ana uygulama yerine Extension Pack indirmek | Windows hosts paketini kurmak | Çözüldü |
| vmwgfx hatası | Görüntü belleğini 128 MB yapmak | Çözülmedi |
| Siyah ekran | Safe Graphics | Çözülmedi |
| CMD'de & hatası | CMD sözdizimine geçmek | Çözüldü |
| Kurulum arayüzünün açılmaması | VBoxSVGA'ya geçmek | Arayüz açıldı |
| Kurulum medyasını çıkarma mesajı | Optik sürücünün boş olduğunu doğrulayıp Enter'a basmak | Yeniden başlatma tamamlandı |

## Bu kurulumdan ne öğrendim?

Sanal makine oluşturma, kaynak ayırma, ISO doğrulama ve işletim sistemi kurulumu yanında hataları adım adım incelemeyi öğrendim. İlk iki çözüm işe yaramadı; grafik denetleyicisini değiştirdikten sonra ayarın gerçekten uygulandığını ayrıca kontrol ettim.

Sonuçta Ubuntu 24.04.4 LTS masaüstüne ulaştım ve terminal üzerinden kurulumu doğruladım. Kurulum süresi, FPS veya benzeri performans ölçümleri kaydetmedim; burada böyle bir ölçüm iddiası yok.

Terminal kullanımını ayrı bölümde ele alacağım. O bölüm yayımlanana kadar burada taslak bağlantısı bulunmayacak.
