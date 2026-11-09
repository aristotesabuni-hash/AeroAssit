import React, { useState, useEffect, useRef } from 'react';
import { ApprovedDocument } from '../types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Layers, 
  Film, 
  Info,
  Volume2,
  VolumeX,
  Wifi,
  Copy,
  Check,
  Link,
  ShieldCheck,
  Send,
  Radio,
  Sparkles
} from 'lucide-react';

interface TravelStepsViewProps {
  documents: ApprovedDocument[];
  onOpenDoc: (doc: ApprovedDocument) => void;
  onNavigateToAssistant?: () => void;
}

export const TravelStepsView: React.FC<TravelStepsViewProps> = ({ documents, onOpenDoc, onNavigateToAssistant }) => {
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'video' | 'gallery'>('video');
  const [lang, setLang] = useState<'fr' | 'en' | 'sw'>('fr');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoVoice, setAutoVoice] = useState<boolean>(false);

  const directDomainUrl = "http://assistant.aeroport.local";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directDomainUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playVoice = (textOverride?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();

    const activeStep = tutorialSteps[currentScene];
    const textToRead = textOverride || activeStep.narrator[lang].replace(/[«»"]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(textToRead);

    if (lang === 'fr') utterance.lang = 'fr-FR';
    else if (lang === 'en') utterance.lang = 'en-US';
    else utterance.lang = 'sw-KE';

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      playVoice();
    }
  };

  // Stop speaking when unmounting or switching view mode
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  // When scene or language changes, trigger speech if autoVoice or currently speaking
  useEffect(() => {
    if (autoVoice && viewMode === 'video') {
      playVoice();
    } else if (isSpeaking) {
      playVoice();
    }
  }, [currentScene, lang]);

  const tutorialSteps = [
    {
      id: 1,
      image: '/src/assets/images/travel_step_preparation_1794237979475.jpg',
      docId: 'DOC-BAG-2026-v2.1',
      title: {
        fr: '1. Préparation à la Maison & Bagages',
        en: '1. Packing at Home & Baggage Rules',
        sw: '1. Maandalizi Nyumbani & Sheria za Mizigo',
      },
      subtitle: {
        fr: 'Rassemblez vos documents d’identité et préparez vos valises',
        en: 'Gather travel documents and pack according to airline size limits',
        sw: 'Kusanya vitambulisho vyako na funga mizigo kulingana na vipimo',
      },
      timing: {
        fr: 'La veille ou le matin du départ',
        en: 'The day before or morning of departure',
        sw: 'Siku moja kabla au asubuhi ya safari',
      },
      narrator: {
        fr: '« Avant de partir, vérifiez la validité de votre pièce d’identité ou passeport et conservez votre billet d’avion. En cabine, votre valise ne doit pas excéder 8 kg. Placez tous les liquides dans des flacons de 100 ml maximum dans une pochette transparente. Attention : les batteries externes (Powerbanks) vont impérativement en cabine, jamais en soute ! »',
        en: '"Before leaving, check the validity of your ID or passport and keep your airline ticket ready. In the cabin, your carry-on must not exceed 8 kg. Store liquids in bottles of max 100 ml inside a clear bag. Note: Powerbanks must strictly stay in your carry-on luggage, never in checked baggage!"',
        sw: '"Kabla ya kuondoka nyumbani, hakikisha kitambulisho au pasipoti yako ni halali na uweke tiketi tayari. Mzigo wa mkononi usizidi kilo 8. Vyakula na maji maji yasiwe zaidi ya mililita 100 kwenye mfuko wa plastiki safi. Powerbank lazima iwe kwenye mzigo wa mkononi!"',
      },
      keyPoints: {
        fr: [
          'Pièce d’identité officielle ou passeport valide.',
          'Billet électronique ou code PNR à portée de main.',
          'Bagage cabine : 8 kg maximum (55 x 35 x 25 cm).',
          'Liquides : flacons de 100 ml max dans un sac transparent (1L).',
          'Powerbank / Batteries : exclusivement en bagage cabine.',
        ],
        en: [
          'Valid national identity card or international passport.',
          'Electronic ticket or 6-character PNR booking code.',
          'Cabin baggage: 8 kg maximum (55 x 35 x 25 cm).',
          'Liquids: bottles of 100 ml max in a 1-liter transparent pouch.',
          'Powerbanks / Lithium batteries: strictly inside cabin baggage.',
        ],
        sw: [
          'Kitambulisho rasmi cha taifa au pasipoti halali.',
          'Tiketi ya kielektroniki au nambari ya PNR mkononi.',
          'Mzigo wa ndani ya ndege: kilo 8 pekee (55 x 35 x 25 cm).',
          'Vimiminika: chupa zisizozidi 100ml kwenye mfuko safi wa lita 1.',
          'Betri za ziada (Powerbanks): lazima zibebwe ndani ya ndege.',
        ],
      },
    },
    {
      id: 2,
      image: '/src/assets/images/travel_step_checkin_1794237979171.jpg',
      docId: 'DOC-ENR-2026-v3.0',
      title: {
        fr: '2. Arrivée à l’Aérogare & Enregistrement',
        en: '2. Arrival at the Terminal & Check-in Desk',
        sw: '2. Kufika Uwanja wa Ndege & Kupima Mizigo',
      },
      subtitle: {
        fr: 'Déposez vos valises de soute et retirez votre carte d’embarquement',
        en: 'Drop off checked luggage on the scale and receive your boarding pass',
        sw: 'Weka mzigo mkubwa kwenye mizani na upokee kadi ya kupandia',
      },
      timing: {
        fr: '2h avant (vol domestique) ou 3h avant (vol international)',
        en: '2 hours before (domestic) or 3 hours before (international)',
        sw: 'Saa 2 kabla (ndege ya ndani) au saa 3 kabla (ndege ya nje)',
      },
      narrator: {
        fr: '« Arrivez à l’aéroport avec au moins 2 heures d’avance. Rendez-vous au comptoir de votre compagnie aérienne. L’agent pèse votre valise de soute (23 kg max) et appose une étiquette bagage avec votre reçu. Présentez votre pièce d’identité pour recevoir votre carte d’embarquement officielle. Attention : les comptoirs ferment 45 minutes avant le décollage ! »',
        en: '"Arrive at the airport at least 2 hours before your flight. Proceed to your airline counter. The agent weighs your checked baggage (23 kg max) and tags it. Present your identity document to receive your official boarding pass. Remember: check-in desks strictly close 45 minutes before departure!"',
        sw: '"Fika kwenye uwanja wa ndege saa 2 mapema. Nenda kwenye kaunta ya shirika lako la ndege. Mhudumu atapima mzigo wako wa suti (kilo 23 mwisho) na kuweka kitambulisho cha mzigo. Onyesha kitambulisho chako ili upate kadi ya kupandia ndege (Boarding Pass)."',
      },
      keyPoints: {
        fr: [
          'Respecter l’avance de 2h (national) ou 3h (international).',
          'Fermeture stricte des comptoirs 45 minutes avant le vol.',
          'Pesée de la valise de soute (franchise usuelle 23 kg).',
          'Retrait de la carte d’embarquement (Boarding Pass).',
        ],
        en: [
          'Arrive 2 hours early (domestic) or 3 hours early (international).',
          'Check-in counters strictly close 45 minutes before flight.',
          'Weighing of checked bag on the scale (standard 23 kg).',
          'Collection of your printed or digital Boarding Pass.',
        ],
        sw: [
          'Kufika mapema saa 2 (ndege za ndani) au saa 3 (za kimataifa).',
          'Kaunta hufungwa dakika 45 kabla ya ndege kuondoka.',
          'Kupima mzigo mkubwa kwenye mizani (kilo 23).',
          'Kupokea kadi ya kupandia ndege yenye jina na nambari yako.',
        ],
      },
    },
    {
      id: 3,
      image: '/src/assets/images/travel_step_security_1794237993261.jpg',
      docId: 'DOC-SEC-2026-v1.4',
      title: {
        fr: '3. Contrôles de Sûreté & Passage du Portique',
        en: '3. Security Checkpoint & Metal Detector Walkthrough',
        sw: '3. Ukaguzi wa Usalama & Kupita Mlango wa Chuma',
      },
      subtitle: {
        fr: 'Déposez manteaux, ordinateurs et métaux dans les bacs de scan',
        en: 'Place laptops, coats, and metals into scanner trays for inspection',
        sw: 'Weka koti, kompyuta na vitu vya chuma kwenye sinia za ukaguzi',
      },
      timing: {
        fr: 'Directement après l’enregistrement au comptoir',
        en: 'Immediately after checking in',
        sw: 'Mara tu baada ya kupima mizigo',
      },
      narrator: {
        fr: '« Au poste de sûreté (PIF), préparez-vous sereinement : déposez dans les bacs en plastique votre veste, ceinture à boucle métallique, montre, clés et téléphone. Sortez votre ordinateur portable ou tablette de sa housse. Franchissez le portique électromagnétique lorsque l’agent vous y invite. Les objets tranchants ou pointus sont formellement confisqués. »',
        en: '"At the security checkpoint, prepare smoothly: place your jacket, metallic belt, watch, keys, and phone into the plastic trays. Take out laptops and tablets so they are scanned separately. Walk through the metal detector portal when signaled by security staff. Sharp objects and tools are confiscated."',
        sw: '"Kwenye kituo cha ukaguzi wa usalama, weka koti lako, mshipi wa chuma, simu, saa na sarafu kwenye sinia za plastiki. Toa kompyuta yako (laptop) kwenye begi. Pita kwenye mlango wa usalama afisa akikuruhusu. Vitu vyenye ncha kali vinazuiliwa kabisa."',
      },
      keyPoints: {
        fr: [
          'Retirer vestes, ceintures métalliques et objets de poches.',
          'Sortir les ordinateurs et tablettes pour un scan individuel.',
          'Franchir le portique de détection sur invitation de l’agent.',
          'Contrôle documentaire par les services de police (DGM).',
        ],
        en: [
          'Remove jackets, metallic belts, and pocket items.',
          'Remove laptops and tablets for separate X-ray inspection.',
          'Walk through the detector arch when called by the officer.',
          'Identity and border police check (DGM stamp).',
        ],
        sw: [
          'Vua koti, mshipi wenye chuma na toa vitu mifukoni.',
          'Toa kompyuta ya pajani kwenye mfuko wake ili ichunguzwe.',
          'Pita taratibu kwenye mlango wa ukaguzi ukiruhusiwa.',
          'Kugongwa muhuri na kukaguliwa na polisi wa mpakani (DGM).',
        ],
      },
    },
    {
      id: 4,
      image: '/src/assets/images/travel_step_waiting_1794237980352.jpg',
      docId: 'DOC-EMB-2026-v1.8',
      title: {
        fr: '4. Salle d’Attente & Écrans d’Information (FIDS)',
        en: '4. Departure Lounge & Flight Display Screens (FIDS)',
        sw: '4. Chumba cha Kusubiri & Skrini za Taarifa (FIDS)',
      },
      subtitle: {
        fr: 'Patientez confortablement et vérifiez votre porte d’embarquement',
        en: 'Relax in the secure departure area and monitor your gate assignment',
        sw: 'Pumzika ukumbini na uangalie nambari ya mlango wa ndege',
      },
      timing: {
        fr: '45 à 60 minutes avant le décollage',
        en: '45 to 60 minutes before takeoff',
        sw: 'Dakika 45 hadi 60 kabla ya ndege kuruka',
      },
      narrator: {
        fr: '« Une fois les contrôles franchis, vous voici dans la salle d’embarquement sécurisée. Consultez régulièrement les grands écrans d’affichage (FIDS) pour connaître l’état de votre vol et votre numéro de porte. Gardez vos bagages à main avec vous et écoutez les annonces au microphone. Notez qu’aucun retour vers la zone publique n’est autorisé sans escorte. »',
        en: '"Once past security, you are now in the departure lounge. Regularly check the large flight information display screens (FIDS) for your departure gate and flight status. Keep your personal belongings with you and listen to audio announcements. Note that returning to the public area is prohibited."',
        sw: '"Baada ya ukaguzi, utaingia kwenye ukumbi wa kusubiri ndege. Angalia skrini kubwa za FIDS ukutani ili kujua hali ya ndege yako na mlango wa kupandia. Usiache mizigo yako peke yake na sikiliza matangazo ya sauti ukumbini."',
      },
      keyPoints: {
        fr: [
          'Zone sécurisée : aucun retour possible en zone publique.',
          'Consulter les écrans officiels FIDS pour le statut et la porte.',
          'Garder ses effets personnels auprès de soi en permanence.',
          'Être attentif aux annonces d’appel par microphone.',
        ],
        en: [
          'Sterile area: returning to the public concourse is not allowed.',
          'Monitor the official FIDS screens for gate updates.',
          'Keep carry-on belongings within reach at all times.',
          'Listen for audio boarding announcements over the speaker.',
        ],
        sw: [
          'Eneo salama: huwezi kurudi nje bila ruhusa ya polisi.',
          'Tazama skrini za FIDS kujua nambari ya mlango wako.',
          'Kaa karibu na mizigo yako wakati wote ukumbini.',
          'Sikiliza matangazo ya sauti yanayotangaza ndege yako.',
        ],
      },
    },
    {
      id: 5,
      image: '/src/assets/images/travel_step_boarding_1794237979927.jpg',
      docId: 'DOC-EMB-2026-v1.8',
      title: {
        fr: '5. Porte & Embarquement dans l’Avion',
        en: '5. Gate & Boarding the Aircraft',
        sw: '5. Mlango & Kupanda Ndani ya Ndege',
      },
      subtitle: {
        fr: 'Présentez votre carte d’accès et montez à bord en toute sérénité',
        en: 'Show your boarding pass and walk through the jet bridge to your seat',
        sw: 'Onyesha kadi yako ya kupandia na uingie kwenye ndege',
      },
      timing: {
        fr: 'Début à H-40 min · Fermeture stricte de la porte à H-15 min',
        en: 'Starts 40 min before flight · Gate strictly closes at H-15 min',
        sw: 'Huanza dakika 40 kabla · Mlango hufungwa dakika 15 kabla',
      },
      narrator: {
        fr: '« Dès l’annonce de votre rangée, préparez votre carte d’embarquement et votre pièce d’identité. L’agent en porte scanne votre code-barres et vous invite à emprunter la passerelle vers l’aéronef. Attention : la porte d’embarquement est définitivement fermée 15 minutes avant le départ. Les passagers retardataires ne pourront plus monter à bord ! Bon voyage ! »',
        en: '"When your boarding group is called, have your boarding pass and photo ID in hand. The gate agent scans your barcode and invites you down the jet bridge corridor to the aircraft. Warning: boarding gates close strictly 15 minutes before departure. Late passengers will not be boarded. Have a safe flight!"',
        sw: '"Kundi lako likitangazwa, weka tayari kadi ya kupandia na kitambulisho chako. Mhudumu wa mlango atachanganua kadi yako na kukuelekeza kwenye njia ya kuingia ndani ya ndege. Kumbuka: mlango hufungwa kabisa dakika 15 kabla ya safari. Safari njema!"',
      },
      keyPoints: {
        fr: [
          'Avoir en main sa carte d’embarquement et pièce d’identité.',
          'Respecter l’ordre d’appel des rangées et priorités PMR.',
          'Fermeture définitive de la porte 15 minutes avant l’heure de vol.',
          'Installation à bord et rangement du bagage cabine dans les coffres.',
        ],
        en: [
          'Hold boarding pass and photo ID ready in hand.',
          'Follow boarding group order and wheelchair assistance priorities.',
          'Boarding gate strictly closes 15 minutes prior to scheduled takeoff.',
          'Stow your carry-on luggage inside the overhead compartment.',
        ],
        sw: [
          'Shika mkononi kadi ya kupandia na kitambulisho chako.',
          'Heshimu utaratibu wa viti na wazee au walemavu kwanza.',
          'Mlango hufungwa rasmi dakika 15 kabla ya kuondoka.',
          'Weka begi la mkononi kwenye sanduku la juu ya kiti chako.',
        ],
      },
    },
  ];

  // Auto-play slideshow video effect
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && viewMode === 'video') {
      timer = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % tutorialSteps.length);
      }, 7000); // 7 seconds per slide
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, viewMode, tutorialSteps.length]);

  const activeStep = tutorialSteps[currentScene];
  const linkedDoc = documents.find((d) => d.id === activeStep.docId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner and Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-sky-600" />
              Tutoriel Vidéo & Guide Illustré du Voyageur
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              5 Étapes en Dessins
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Découvrez comment voyager sereinement grâce à ce tutoriel animé par des illustrations pas-à-pas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <button
              onClick={() => setLang('fr')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'fr'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('sw')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'sw'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              SW
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('video')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'video'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Lecteur Vidéo
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'gallery'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Toutes les Étapes
            </button>
          </div>
        </div>
      </div>

      {/* Direct Domain Network Access Card (Official domain name - IP hidden for security) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 rounded-2xl border border-sky-200 dark:border-sky-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-3.5 flex-1">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Wifi className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Link className="w-4 h-4 text-sky-600" />
                {lang === 'fr' && 'Accès direct smartphone via nom de domaine officiel :'}
                {lang === 'en' && 'Direct smartphone access via official domain name:'}
                {lang === 'sw' && 'Upatikanaji kwenye simu kupitia jina la kikoa:'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Wi-Fi Lab (VLAN 60)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center gap-1 border border-sky-200 dark:border-sky-800">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                <span>Adresse IP masquée (Sécurité anti-piratage)</span>
              </span>
            </div>

            {/* Official Domain Name Display with 1-click copy */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-700 shadow-2xs">
                <span className="text-slate-400 font-mono text-xs">http://</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-xs sm:text-sm selection:bg-sky-500 selection:text-white tracking-wide">
                  assistant.aeroport.local
                </span>
              </div>

              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedUrl ? 'Domaine copié !' : 'Copier le nom de domaine'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
              {lang === 'fr' && 'Sécurité renforcée : l’adresse IP directe est masquée pour protéger les serveurs contre les scans et les attaques. Connectez votre téléphone au Wi-Fi AEROPORT-GOMA-GUEST et tapez simplement assistant.aeroport.local dans votre navigateur pour ouvrir l’assistant.'}
              {lang === 'en' && 'Enhanced security: direct IP addresses are hidden to protect servers against unauthorized scanning. Connect to AEROPORT-GOMA-GUEST Wi-Fi and type assistant.aeroport.local in your browser.'}
              {lang === 'sw' && 'Usalama wa juu: anwani ya IP imefichwa kuzuia wadukuzi. Unganisha simu na Wi-Fi ya AEROPORT-GOMA-GUEST kisha andika assistant.aeroport.local kwenye kivinjari chako.'}
            </p>
          </div>
        </div>

        {onNavigateToAssistant && (
          <div className="shrink-0 self-stretch sm:self-auto flex items-center justify-end">
            <button
              onClick={onNavigateToAssistant}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Ouvrir l’Assistant Passagers</span>
            </button>
          </div>
        )}
      </div>

      {/* MODE 1 : LECTEUR VIDÉO / DIAPORAMA ANIMÉ AVEC DESSINS */}
      {viewMode === 'video' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col space-y-0">
          {/* Main Visual Display (Video Screen Canvas) */}
          <div className="relative aspect-16/9 w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
            <img
              src={activeStep.image}
              alt={activeStep.title[lang]}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
            />

            {/* Video Overlay Top Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-slate-900/85 text-white text-xs font-bold tracking-wide backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Scène {activeStep.id} / 5
              </span>
              <span className="hidden sm:inline px-3 py-1 rounded-md bg-slate-900/85 text-slate-200 text-xs font-medium backdrop-blur-sm border border-white/10">
                {activeStep.timing[lang]}
              </span>
            </div>

            {/* Video Bottom Title Bar Scrim */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 sm:p-6 text-white z-10">
              <h2 className="text-base sm:text-2xl font-bold tracking-tight drop-shadow-md">
                {activeStep.title[lang]}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl drop-shadow-sm">
                {activeStep.subtitle[lang]}
              </p>
            </div>
          </div>

          {/* Video Player Timeline & Controls Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Step thumbnail selector buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {tutorialSteps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentScene(idx);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    currentScene === idx
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>Étape {s.id}</span>
                </button>
              ))}
            </div>

            {/* Playback Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCurrentScene((prev) => (prev > 0 ? prev - 1 : tutorialSteps.length - 1));
                  setIsPlaying(false);
                }}
                title="Étape précédente"
                className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Lecture Auto'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentScene((prev) => (prev + 1) % tutorialSteps.length);
                  setIsPlaying(false);
                }}
                title="Étape suivante"
                className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentScene(0);
                  setIsPlaying(true);
                }}
                title="Recommencer depuis le début"
                className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Educational Narrator & Practical Instructions Section */}
          <div className="p-6 space-y-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {/* Audio Narrator Caption Box with REAL Voice Synthesis */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-sky-50/70 to-indigo-50/40 dark:from-sky-950/40 dark:via-sky-950/30 dark:to-indigo-950/20 border border-sky-200 dark:border-sky-800 text-xs sm:text-sm text-sky-950 dark:text-sky-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-200/60 dark:border-sky-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                    isSpeaking ? 'bg-rose-600 text-white animate-bounce' : 'bg-sky-600 text-white'
                  }`}>
                    {isSpeaking ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider text-sky-800 dark:text-sky-300 flex items-center gap-2">
                      <span>Commentaire du Guide Vocal (Voix Réelle)</span>
                      {isSpeaking && (
                        <div className="flex items-end gap-0.5 h-3.5 px-1 bg-rose-100 dark:bg-rose-950/80 rounded">
                          <span className="w-1 bg-rose-600 rounded-full animate-[bounce_0.8s_infinite] h-2" />
                          <span className="w-1 bg-rose-600 rounded-full animate-[bounce_0.6s_infinite_0.2s] h-3.5" />
                          <span className="w-1 bg-rose-600 rounded-full animate-[bounce_0.9s_infinite_0.4s] h-2.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isSpeaking ? 'Lecture vocale en cours...' : 'Cliquez ci-contre pour écouter l’explication de cette scène à voix haute'}
                    </span>
                  </div>
                </div>

                {/* Voice Control Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={toggleVoice}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                      isSpeaking
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/50'
                        : 'bg-sky-600 hover:bg-sky-700 text-white'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Arrêter la voix</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Écouter la voix du guide</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const next = !autoVoice;
                      setAutoVoice(next);
                      if (next && !isSpeaking) {
                        playVoice();
                      } else if (!next && isSpeaking) {
                        stopVoice();
                      }
                    }}
                    title="Lire automatiquement le commentaire à chaque changement d'étape"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                      autoVoice
                        ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Auto-voix : {autoVoice ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Narrator Text in Quotes */}
              <div className="text-xs sm:text-sm italic leading-relaxed text-slate-800 dark:text-slate-200 pl-1 border-l-2 border-sky-500/50">
                {activeStep.narrator[lang]}
              </div>
            </div>

            {/* Checklist of actions for this scene */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions clés à effectuer à cette étape :
                </h3>
                {linkedDoc && (
                  <button
                    onClick={() => onOpenDoc(linkedDoc)}
                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Consulter la procédure officielle {linkedDoc.id}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {activeStep.keyPoints[lang].map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2 : GRILLE COMPLÈTE DE TOUTES LES ÉTAPES (GALERIE DESSINÉE) */}
      {viewMode === 'gallery' && (
        <div className="space-y-6">
          {tutorialSteps.map((step) => (
            <div
              key={step.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0"
            >
              {/* Illustration Drawing Column (5 cols) */}
              <div className="md:col-span-5 relative aspect-16/9 md:aspect-auto bg-slate-950 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title[lang]}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/85 text-white text-xs font-bold backdrop-blur-xs">
                  Étape {step.id} / 5
                </div>
              </div>

              {/* Explanations & Checklist Column (7 cols) */}
              <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-sky-600">{step.timing[lang]}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {step.title[lang]}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-sky-400 pl-3 py-1 flex-1">
                      {step.narrator[lang]}
                    </p>
                    <button
                      onClick={() => playVoice(step.narrator[lang])}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors self-start sm:self-center"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Écouter la voix</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Points obligatoires :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {step.keyPoints[lang].map((p, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
