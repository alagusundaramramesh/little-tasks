import React, { useEffect, useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./banger.css";

export default function Banger() {
  const spotlightLeft = 520;
  const stageRef = useRef(null);
  const characterTrackRef = useRef(null);

  const characterImages = useMemo(
    () => ["char1", "char2", "char3", "char4", "char5", "char6"],
    []
  );

  useEffect(() => {
    document.title = "Banger - ChennaiGames";
  }, []);

  useEffect(() => {
    const object1 = document.querySelector(".moving-object-1");
    const object2 = document.querySelector(".moving-object-2");
    const heroSection = document.querySelector(".hero-section");

    const handleScroll = () => {
      if (!object1 || !object2 || !heroSection) return;

      const rect = heroSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isMobile = window.innerWidth <= 768;

      if (rect.top < windowHeight && rect.bottom > 0) {
        let progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        progress = Math.max(0, Math.min(1, progress));

        const moveX = isMobile
          ? Math.min(progress * 180, 80)
          : Math.min(progress * 600, 234);

        object1.style.transform = `translate(${moveX}px, -50%)`;
        object2.style.transform = `translate(-${moveX}px, -50%)`;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal");
    if (!revealItems.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { threshold: 0.2 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      revealItems.forEach((item) => observer.unobserve(item));
      observer.disconnect();
    };
  }, []);

  const stadiumSettings = {
    dots: true,
    arrows: true,
    speed: 300,
    fade: true,
    cssEase: "linear",
    autoplay: true,
    autoplaySpeed: 2300
  };

  const phoneSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 700,
    fade: true,
    cssEase: "linear",
    autoplay: true,
    autoplaySpeed: 1800,
    pauseOnHover: false
  };

  const desktopCharacterSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    speed: 1000,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    waitForAnimate: false,
    cssEase: "linear"
  };

  const mobileCharacterSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    waitForAnimate: false,
    cssEase: "linear",
    centerMode: true,
    centerPadding: "0px"
  };

  return (
    <>  
    <style>
              {
                  `
        `
              }
          </style>
    <div className="banger-page">
      <div className="banger-top-strip" />

      <section className="section-1">
        <video autoPlay loop muted playsInline>
          <source src="/images/banger/file.mp4" type="video/mp4" />
        </video>

        <div className="container-fluid overlay-content">
          <div className="row">
            <div className="col-md-7 col-sm-6" />
            <div className="col-md-5 col-sm-6">
              <div className="right-panel">
                <div className="banger-logo-wrap">
                  <img className="logo-img" src="/images/banger/logo.png" width="670" alt="Banger Logo" />
                </div>
                <div className="store-icons banger-store-wrap">
                  <img src="/images/playstore.png" alt="Google Play" />
                  <img src="/images/app_store_v2.png" alt="App Store" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-section">
        <img className="hero-bg" src="/images/banger/bg2.png" alt="Banger background" />
        <div className="moving-object-1">
          <img src="/images/banger/ball.png" alt="Ball" />
        </div>
        <div className="moving-object-2">
          <img src="/images/banger/flying_char.png" alt="Player" />
        </div>
        <div className="bottom-goalpost-div">
          <div className="bottom-goalpost-bg" />
          <p>
            "BANGER" is a fast-paced, 1v1 online arcade football game developed by Chennai Games that focuses on
            individual player control and timed Events.
          </p>
          <img className="arc-img" src="/images/banger/arc.png" alt="Arc" />
        </div>
      </section>

      <section className="feature-section-1 feature-clip-a">
        <div className="container-fluid">
          <div className="row feature-row">
            <div className="col-md-6 reveal reveal-left feature-text">
              <h4 className="banger-feature-title">PRECISION</h4>
              <h5 className="banger-feature-subtitle">Master Every Shot</h5>
              <h6 className="banger-feature-copy">
                Bend,Curve and Strike with Accuracy as you outplay your opponent in high pressure penalty moments.
              </h6>
            </div>
            <div className="col-md-6 reveal reveal-right feature-image-wrap">
              <img src="/images/banger/sec1.png" alt="Precision" />
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section feature-clip-b">
        <div className="container-fluid">
          <div className="row feature-row">
            <div className="col-md-7 reveal reveal-left feature-image-wrap">
              <img src="/images/banger/sec2.png" alt="Reflex" />
            </div>
            <div className="col-md-5 reveal reveal-right feature-text">
              <h4 className="banger-feature-title">REFLEX</h4>
              <h5 className="banger-feature-subtitle">Defend like a Pro</h5>
              <h6 className="banger-feature-copy">
                Switch roles and become the goal keeper aniticipate,react and block every incoming shot to stay a
                head
              </h6>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section banger-duel-section">
        <div className="gallery-layout">
          <div className="gradient-div" />
          <div className="container-fluid">
            <div className="row feature-row">
              <div className="col-md-5 reveal reveal-left feature-text">
                <h4 className="banger-feature-title">Duel</h4>
                <h5 className="banger-feature-subtitle">Win the Face off</h5>
                <h6 className="banger-feature-copy">
                  Take turns to shoot and defend in intense 1 v 1 battles where every goal counts towards victory.
                </h6>
              </div>
              <div className="col-md-7 reveal reveal-right feature-image-wrap">
                <img src="/images/banger/sec3.png" alt="Duel" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="character-stage" ref={stageRef}>
        <div className="gallery-layout-player">
          <div className="gradient-div-player" />
          <div className="image-div-player" style={{ backgroundImage: "url('/images/banger/player_hub.png')" }}>
            <div className="col-lg-container-fluid">
              <div className="row gallery-overlay">
                <img
                  className="spotlight-img"
                  src="/images/banger/light.png"
                  alt="Spotlight"
                  style={{ left: `${spotlightLeft}px` }}
                />
                <div className="col-lg-12 col-md-12 col-sm-12 banger-character-col">
                  <div className="character-container desktop-character-slider" ref={characterTrackRef}>
                    <Slider {...desktopCharacterSettings}>
                      {characterImages.map((name, idx) => (
                        <div key={`desktop-${name}`}>
                          <div className="banger-character-card">
                            <div className="banger-character-image-wrap">
                              <img
                                src={`/images/banger/${name}.avif`}
                                alt={`Character ${idx + 1}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>

                  <div className="character-container mobile-character-slider">
                    <MinionSlider/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="banger-player-title player">PLAYER&nbsp;</p>
        <p className="banger-player-title gallery">GALLERY</p>
      </section>

      <section>
        <p className="banger-stadium-title">STADIUM GALLERY</p>
        <div className="slider-container feature-clip-slider">
          <Slider {...stadiumSettings}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={`stadium-${idx}`} className="slide">
                <img src={`/images/banger/${idx}.jpg`} alt={`Stadium ${idx}`} />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <section className="banger-screens-section">
        <div className="container-fluid">
          <h3 className="text-center banger-screens-title">GAME SCREENSHOTS</h3>
          <div className="row banger-screens-row">
            <div className="col-md-2" />
            <div className="col-md-8">
              <div className="phone-slider-wrapper">
                <div className="phone-slider">
                  <Slider {...phoneSettings}>
                    <div className="phone-slide">
                      <img
                        src="/images/banger/Media 1.avif"
                        alt="Ice Land"
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                      />
                      <p>Ice Land</p>
                    </div>
                    <div className="phone-slide">
                      <img src="/images/banger/Media 2.avif" alt="Taj Mahal" loading="lazy" decoding="async" />
                      <p>Taj Mahal</p>
                    </div>
                    <div className="phone-slide">
                      <img src="/images/banger/Media 3.avif" alt="Tower Bridge" loading="lazy" decoding="async" />
                      <p>Tower Bridge</p>
                    </div>
                  </Slider>
                </div>
                <img className="phone-overlay" src="/images/banger/screen.png" alt="Phone Frame" />
              </div>
            </div>
            <div className="col-md-2" />
          </div>
        </div>
      </section>

      <section className="section-last">
        <div>
          <img src="/images/banger/logo.png" className="banger-logo-bottom" alt="Banger" />
        </div>

        <div className="container-fluid">
          <h2 className="cta-title">Can You Handle The Perfect Shot?</h2>
          <p className="cta-subtitle">Download BANGER now !</p>
          <div className="cta-buttons">
            <a
              href="https://play.google.com/store/apps/details?id=com.chennaigames.rush21.blackjack"
              target="_blank"
              rel="noreferrer"
            >
              <img alt="Get it on Google Play" src="/images/playstore.avif" className="banger-store-badge" />
            </a>
            <a href="https://apps.apple.com/us/app/id6758206291" target="_blank" rel="noreferrer">
              <img alt="Download on the App Store" src="/images/app_store_v2.avif" className="banger-store-badge" />
            </a>
          </div>
        </div>
      </section>
    </div>
    </>

  );
}
const characters = [];

for (let index = 1; index <= 8; index++) {
    characters.push(`/images/banger/char${index}.avif`);
}



function MinionSlider() {
    const [activeIndex, setActiveIndex] = useState(0);

    const settings = {
        dots: false,
        arrows: false,
        centerMode: true,
        infinite: true,
        centerPadding: "0px",
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 3000,
        focusOnSelect: true,
        beforeChange: (current, next) => setActiveIndex(next),
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-10">
            <Slider {...settings} style={{

            }}>
                {characters.map((src, idx) => {
                    const isCenter = idx === activeIndex;
                    return (
                        <div key={idx} className="px-2">
                            <div
                                className={`relative transition-all duration-500 ${isCenter ? "scale-110 z-10" : "scale-90"
                                    }`}
                            >
                                <img
                                    src={src}
                                    alt={`char-${idx}`}
                                    className="mx-auto"
                                    width={isCenter ? "72%" : "60%"}
                                    style={{
                                        height: "auto",
                                        maxWidth: "420px",
                                        filter: isCenter ? "brightness(1)" : "brightness(0)",
                                        transform: isCenter ? "none" : "scale(0.5)",
                                        transition: "all 1s ease-in-out"
                                    }}
                                />
                                {!isCenter && (
                                    <div className="absolute inset-0 bg-black opacity-50"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
}