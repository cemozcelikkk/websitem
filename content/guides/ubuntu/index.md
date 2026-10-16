---
title: Ubuntu
description: Ubuntu kurulumu, Linux terminal komutları, dosya yönetimi, kullanıcı yetkileri ve sistem yönetimi üzerine uygulamalı rehberler.
order: 1
draft: false
---

## Ubuntu nedir?

Ubuntu, Linux çekirdeğini kullanan, açık kaynaklı bir işletim sistemi dağıtımıdır. Masaüstü sürümü tarayıcı, dosya yöneticisi ve grafik arayüzle günlük kullanım sunar; terminal üzerinden yazılım geliştirme ve sistem yönetimi çalışmalarına da uygundur.

Ubuntu ile VirtualBox birbirinin alternatifi değildir. Ubuntu işletim sistemidir; VirtualBox ise bu işletim sistemini mevcut bilgisayarının içinde bir sanal makinede çalıştırmanı sağlayan yazılımdır. Asıl seçim, Ubuntu'yu hangi yöntemle kullanacağına karar vermektir.

## VirtualBox, Dual Boot, doğrudan kurulum ve WSL2

| Yöntem | Nasıl çalışır? | Ne zaman tercih edilir? | Dikkat edilmesi gereken |
| --- | --- | --- | --- |
| VirtualBox | Ubuntu, Windows gibi mevcut işletim sisteminin içinde ayrı bir sanal makinede çalışır. | Ubuntu masaüstünü, kurulum adımlarını ve sistem yönetimini öğrenmek; deneyler için ayrı ortam oluşturmak. | RAM, işlemci ve disk ana sistemle paylaşılır. Grafik ve donanım erişimi fiziksel kurulumdan farklıdır. |
| Dual Boot | Windows ve Ubuntu ayrı disk veya bölümlerde bulunur; açılışta biri seçilir. | İki işletim sistemini koruyarak Ubuntu'yu doğrudan donanım üzerinde kullanmak. | Sistem değiştirmek için yeniden başlatılır. Disk bölümlendirmesi öncesinde yedek ve varsa BitLocker kurtarma anahtarı hazırlanmalıdır. |
| Doğrudan kurulum | Ubuntu bilgisayarın ana işletim sistemi olur. | Günlük çalışma ortamını Ubuntu'ya taşımak ve donanımı doğrudan kullanmak. | Wi-Fi, ekran kartı ve gerekli uygulamaların uyumu önceden kontrol edilir. Diski silme seçeneği mevcut verileri kaldırır. |
| WSL2 | Windows içinde, yönetimi Windows tarafından yapılan hafif bir sanal makinede Linux çekirdeği çalışır. | Windows'tan ayrılmadan terminal, geliştirme araçları ve Linux tabanlı iş akışları kullanmak. | Tam bir Ubuntu masaüstü kurulumunu ve açılış sürecini öğrenmekle aynı deneyim değildir. Grafik uygulama desteği, bütün masaüstü ortamının eşdeğeri olduğu anlamına gelmez. |

WSL2'nin sanallaştırma yaklaşımı ve Windows entegrasyonu için [Microsoft'un WSL sürüm karşılaştırmasına](https://learn.microsoft.com/en-us/windows/wsl/compare-versions) bakabilirsin.

## Hangi yöntemle başlamalıyım?

Ubuntu'yu ilk kez deniyor, masaüstünü görmek ve kurulum sürecini öğrenmek istiyorsan VirtualBox uygun bir başlangıçtır. Sanal diske kurulum yaptığında ana işletim sisteminin disk bölümlerini değiştirmen gerekmez. Sanal makine de gerçek dosyalar ve ağ bağlantılarıyla çalışır; paylaşılan klasör gibi özellikleri ihtiyacına göre açmalısın.

Amacın Windows üzerinde kod yazarken Linux terminali kullanmaksa WSL2 daha doğrudan bir yol sunabilir. Buna karşılık Ubuntu'yu günlük ana sistemin yapmak istiyorsan önce bir canlı USB ile donanımını denemek, ardından Dual Boot veya doğrudan kurulumu değerlendirmek daha anlamlıdır.

Bu yöntemlerin tek bir genel performans sıralaması yoktur. Sonuç; donanımına, ayırdığın kaynaklara ve çalıştırdığın uygulamaya bağlıdır. Burada karşılaştırmalı hız ölçümü veya denenmiş kurulum süresi iddiası bulunmuyor.

## Rehbere nasıl devam edeceğiz?

İlk bölüm, VirtualBox üzerinde Ubuntu kurulumuna ayrılıyor. Sonraki bölümler yayımlandıkça aşağıdaki listede görünecek; bölüm sonlarındaki bağlantılar yalnızca yayımlanmış bölümlere götürecek.
