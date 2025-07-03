// Muchacha Grande FC - Video Poker Game
// poker.js - Main game logic (VERSIÓN COMPLETA CORREGIDA)

const { useState, useEffect } = React;

// Iconos personalizados simples (reemplazo de lucide-react)
const Shuffle = () => (
    React.createElement('svg', {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    }, [
        React.createElement('polyline', { key: 'poly1', points: "16,3 21,3 21,8" }),
        React.createElement('line', { key: 'line1', x1: "4", y1: "20", x2: "21", y2: "3" }),
        React.createElement('polyline', { key: 'poly2', points: "21,16 21,21 16,21" }),
        React.createElement('line', { key: 'line2', x1: "15", y1: "15", x2: "21", y2: "21" }),
        React.createElement('line', { key: 'line3', x1: "4", y1: "4", x2: "9", y2: "9" })
    ])
);

const Play = () => (
    React.createElement('svg', {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    }, [
        React.createElement('polygon', { key: 'polygon', points: "5,3 19,12 5,21" })
    ])
);

const RotateCcw = () => (
    React.createElement('svg', {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    }, [
        React.createElement('polyline', { key: 'polyline', points: "1,4 1,10 7,10" }),
        React.createElement('path', { key: 'path', d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })
    ])
);

const Trophy = () => (
    React.createElement('svg', {
        width: "32",
        height: "32",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    }, [
        React.createElement('line', { key: 'line1', x1: "8", y1: "21", x2: "16", y2: "21" }),
        React.createElement('line', { key: 'line2', x1: "12", y1: "17", x2: "12", y2: "21" }),
        React.createElement('path', { key: 'path1', d: "M6 17h12l1-7H5l1 7z" }),
        React.createElement('path', { key: 'path2', d: "M2 10h3m14 0h3" })
    ])
);

const Star = () => (
    React.createElement('svg', {
        width: "8",
        height: "8",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        stroke: "currentColor",
        strokeWidth: "2"
    }, [
        React.createElement('polygon', { 
            key: 'polygon', 
            points: "12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" 
        })
    ])
);
const VideoPoker = () => {
  // Game State
  const [chips, setChips] = useState(1000);
  const [bet, setBet] = useState(1);
  const [cards, setCards] = useState([]);
  const [heldCards, setHeldCards] = useState([false, false, false, false, false]);
  const [gamePhase, setGamePhase] = useState('betting'); // betting, dealt, drawn, doubleUp
  const [lastWin, setLastWin] = useState(0);
  const [winningHand, setWinningHand] = useState('');
  const [doubleUpCard, setDoubleUpCard] = useState(null);
  const [doubleUpChoice, setDoubleUpChoice] = useState('');
  const [showDoubleResult, setShowDoubleResult] = useState(false);
  const [doubleUpHistory, setDoubleUpHistory] = useState([]); // Cartas ganadoras anteriores
  const [doubleUpRound, setDoubleUpRound] = useState(0); // Contador de rondas
  const [stats, setStats] = useState({ handsPlayed: 0, totalWon: 0, biggestWin: 0 });
  
  // Animation States
  const [isDealing, setIsDealing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedCards, setRevealedCards] = useState([false, false, false, false, false]);
  const [doubleUpFlipping, setDoubleUpFlipping] = useState(false);

  // Sistema de Sonidos (AGREGAR DESPUÉS DE LOS STATES)
  const [audioContext, setAudioContext] = useState(null);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Inicializar Audio Context
  useEffect(() => {
    const initAudio = () => {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);
      } catch (error) {
        console.log('Audio no soportado:', error);
      }
    };
    
    initAudio();
    
    // Cleanup
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Función para generar sonido realista de carta girando (tipo "flip")
  const playCardFlipSound = (pitch = 1) => {
    if (!audioContext || !soundsEnabled) return;
    
    try {
      // Asegurar que el contexto esté activo
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      const duration = 0.08; // Muy corto y rápido como el sonido real
      
      // Crear el "snap" inicial (como carta doblándose)
      const snapDuration = 0.02;
      const snapBuffer = audioContext.createBuffer(1, audioContext.sampleRate * snapDuration, audioContext.sampleRate);
      const snapData = snapBuffer.getChannelData(0);
      
      // Generar el "click" inicial con ruido impulsivo
      for (let i = 0; i < snapData.length; i++) {
        const progress = i / snapData.length;
        // Impulso inicial muy rápido
        const impulse = Math.exp(-progress * 15) * (Math.random() - 0.5);
        snapData[i] = impulse * 0.3;
      }
      
      // Crear el "swoosh" que sigue (aire moviéndose)
      const swooshDuration = duration - snapDuration;
      const swooshBuffer = audioContext.createBuffer(1, audioContext.sampleRate * swooshDuration, audioContext.sampleRate);
      const swooshData = swooshBuffer.getChannelData(0);
      
      // Generar el aire/fricción después del snap
      for (let i = 0; i < swooshData.length; i++) {
        const progress = i / swooshData.length;
        // Ruido filtrado que decae
        const noise = (Math.random() - 0.5) * Math.exp(-progress * 8) * 0.15;
        swooshData[i] = noise;
      }
      
      // Reproducir el snap (click inicial)
      const snapSource = audioContext.createBufferSource();
      const snapGain = audioContext.createGain();
      const snapFilter = audioContext.createBiquadFilter();
      
      snapSource.buffer = snapBuffer;
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(2000 * pitch, now); // Frecuencia alta para el "click"
      snapFilter.Q.setValueAtTime(2, now);
      
      snapGain.gain.setValueAtTime(0.05, now); // Muy sutil
      
      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(audioContext.destination);
      
      snapSource.start(now);
      snapSource.stop(now + snapDuration);
      
      // Reproducir el swoosh (aire después)
      const swooshSource = audioContext.createBufferSource();
      const swooshGain = audioContext.createGain();
      const swooshFilter = audioContext.createBiquadFilter();
      
      swooshSource.buffer = swooshBuffer;
      swooshFilter.type = 'highpass';
      swooshFilter.frequency.setValueAtTime(1200 * pitch, now + snapDuration);
      swooshFilter.Q.setValueAtTime(0.5, now + snapDuration);
      
      // Fade in y fade out muy rápido
      swooshGain.gain.setValueAtTime(0, now + snapDuration);
      swooshGain.gain.linearRampToValueAtTime(0.03, now + snapDuration + 0.01);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      swooshSource.connect(swooshFilter);
      swooshFilter.connect(swooshGain);
      swooshGain.connect(audioContext.destination);
      
      swooshSource.start(now + snapDuration);
      swooshSource.stop(now + duration);
      
    } catch (error) {
      console.log('Error reproduciendo sonido:', error);
    }
  };

  // Función para sonido de repartir cartas (más sutil)
  const playDealSound = () => {
    if (!audioContext || !soundsEnabled) return;
    playCardFlipSound(0.8); // Pitch más bajo para deal
  };

  // Función para sonido de draw (cambio de cartas)
  const playDrawSound = () => {
    if (!audioContext || !soundsEnabled) return;
    playCardFlipSound(1.2); // Pitch más alto para draw
  };

  // Función mejorada para inicializar audio con interacción del usuario
  const initializeAudioWithUserGesture = async () => {
    if (!audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed successfully');
        
        // Reproducir sonido de prueba muy bajo para verificar
        const testOscillator = audioContext.createOscillator();
        const testGain = audioContext.createGain();
        
        testOscillator.frequency.value = 440;
        testGain.gain.value = 0.01; // Muy bajo
        
        testOscillator.connect(testGain);
        testGain.connect(audioContext.destination);
        
        testOscillator.start();
        testOscillator.stop(audioContext.currentTime + 0.1);
        
        console.log('Test sound played');
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  // Función mejorada para toggle de sonidos que también inicializa audio
  const toggleSounds = async () => {
    if (!soundsEnabled && audioContext) {
      // Al activar sonidos, asegurarse de que el contexto esté activo
      await initializeAudioWithUserGesture();
    }
    setSoundsEnabled(!soundsEnabled);
    
    if (!soundsEnabled) {
      console.log('Sonidos activados');
    } else {
      console.log('Sonidos desactivados');
    }
  };

  // Game Constants
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  // Pay Table (Jacks or Better 9/6 Full Pay)
  const payTable = {
    'Royal Flush': [250, 500, 750, 1000, 4000],
    'Straight Flush': [50, 100, 150, 200, 250],
    'Four of a Kind': [25, 50, 75, 100, 125],
    'Full House': [9, 18, 27, 36, 45],
    'Flush': [6, 12, 18, 24, 30],
    'Straight': [4, 8, 12, 16, 20],
    'Three of a Kind': [3, 6, 9, 12, 15],
    'Two Pair': [2, 4, 6, 8, 10],
    'Jacks or Better': [1, 2, 3, 4, 5]
  };

  // Deck Management
  const createDeck = () => {
    const deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  };

  const shuffleDeck = (deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };
  // Game Actions (MODIFICADO con sonidos)
  const dealCards = () => {
    if (chips < bet) return;
    
    setChips(chips - bet);
    setIsDealing(true);
    setRevealedCards([false, false, false, false, false]);
    
    const deck = shuffleDeck(createDeck());
    const newCards = deck.slice(0, 5);
    setCards(newCards);
    setHeldCards([false, false, false, false, false]);
    setLastWin(0);
    setWinningHand('');
    
    // Reveal cards one by one with delay and sound
    newCards.forEach((_, index) => {
      setTimeout(() => {
        // Reproducir sonido de carta al revelar
        playDealSound();
        
        setRevealedCards(prev => {
          const newRevealed = [...prev];
          newRevealed[index] = true;
          return newRevealed;
        });
        
        // When last card is revealed, change phase and apply suggestions
        if (index === 4) {
          setTimeout(() => {
            setIsDealing(false);
            setGamePhase('dealt');
            
            // APLICAR SUGERENCIAS AUTOMÁTICAMENTE después de un pequeño delay
            setTimeout(() => {
              const suggestions = analyzeHandForSuggestions(newCards);
              setHeldCards(suggestions);
            }, 500);
            
          }, 300);
        }
      }, index * 200);
    });
  };

  const toggleHold = (index) => {
    if (gamePhase !== 'dealt') return;
    const newHeld = [...heldCards];
    newHeld[index] = !newHeld[index];
    setHeldCards(newHeld);
  };

  const drawCards = () => {
    setIsDrawing(true);
    const deck = shuffleDeck(createDeck());
    let deckIndex = 0;
    const newCards = [...cards];
    
    // First flip cards that are not held (show back)
    const cardsToReplace = [];
    for (let i = 0; i < 5; i++) {
      if (!heldCards[i]) {
        cardsToReplace.push(i);
        setRevealedCards(prev => {
          const newRevealed = [...prev];
          newRevealed[i] = false;
          return newRevealed;
        });
      }
    }
    
    // Si no hay cartas para cambiar (todas están en HOLD), terminar inmediatamente
    if (cardsToReplace.length === 0) {
      setTimeout(() => {
        setIsDrawing(false);
        setGamePhase('drawn');
        
        const result = evaluateHand(newCards);
        if (result.payout > 0) {
          const winAmount = result.payout * bet;
          setLastWin(winAmount);
          setWinningHand(result.hand);
          setStats(prev => ({
            handsPlayed: prev.handsPlayed + 1,
            totalWon: prev.totalWon + winAmount,
            biggestWin: Math.max(prev.biggestWin, winAmount)
          }));
        } else {
          setStats(prev => ({ ...prev, handsPlayed: prev.handsPlayed + 1 }));
        }
      }, 500); // Pequeño delay para que se vea que se procesó
      return;
    }
    
    // After 300ms, start revealing new cards
    setTimeout(() => {
      cardsToReplace.forEach((cardIndex, arrayIndex) => {
        // Ensure we don't use a card we already have
        while (newCards.some(card => 
          deck[deckIndex].suit === card.suit && deck[deckIndex].rank === card.rank
        )) {
          deckIndex++;
        }
        newCards[cardIndex] = deck[deckIndex];
        deckIndex++;
        
        // Reveal each new card with delay and sound
        setTimeout(() => {
          // Reproducir sonido de carta al cambiar
          playDrawSound();
          
          setCards([...newCards]);
          setRevealedCards(prev => {
            const newRevealed = [...prev];
            newRevealed[cardIndex] = true;
            return newRevealed;
          });
          
          // When last new card is revealed
          if (arrayIndex === cardsToReplace.length - 1) {
            setTimeout(() => {
              setIsDrawing(false);
              setGamePhase('drawn');
              
              const result = evaluateHand(newCards);
              if (result.payout > 0) {
                const winAmount = result.payout * bet;
                setLastWin(winAmount);
                setWinningHand(result.hand);
                setStats(prev => ({
                  handsPlayed: prev.handsPlayed + 1,
                  totalWon: prev.totalWon + winAmount,
                  biggestWin: Math.max(prev.biggestWin, winAmount)
                }));
              } else {
                setStats(prev => ({ ...prev, handsPlayed: prev.handsPlayed + 1 }));
              }
            }, 300);
          }
        }, arrayIndex * 150);
      });
    }, 300);
  };
  // Hand Evaluation
  const evaluateHand = (hand) => {
    const rankCounts = {};
    const suitCounts = {};
    const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    
    hand.forEach(card => {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = Object.values(suitCounts).some(count => count === 5);
    
    const sortedRanks = hand.map(card => rankValues[card.rank]).sort((a, b) => a - b);
    const isSequential = sortedRanks.every((rank, index) => index === 0 || rank === sortedRanks[index - 1] + 1);
    const isRoyalSequence = JSON.stringify(sortedRanks) === JSON.stringify([10, 11, 12, 13, 14]);
    
    if (isFlush && isRoyalSequence) return { hand: 'Royal Flush', payout: payTable['Royal Flush'][bet - 1] };
    if (isFlush && isSequential) return { hand: 'Straight Flush', payout: payTable['Straight Flush'][bet - 1] };
    if (counts[0] === 4) return { hand: 'Four of a Kind', payout: payTable['Four of a Kind'][bet - 1] };
    if (counts[0] === 3 && counts[1] === 2) return { hand: 'Full House', payout: payTable['Full House'][bet - 1] };
    if (isFlush) return { hand: 'Flush', payout: payTable['Flush'][bet - 1] };
    if (isSequential) return { hand: 'Straight', payout: payTable['Straight'][bet - 1] };
    if (counts[0] === 3) return { hand: 'Three of a Kind', payout: payTable['Three of a Kind'][bet - 1] };
    if (counts[0] === 2 && counts[1] === 2) return { hand: 'Two Pair', payout: payTable['Two Pair'][bet - 1] };
    
    // Jacks or Better
    const highPairs = Object.entries(rankCounts).filter(([rank, count]) => 
      count === 2 && ['J', 'Q', 'K', 'A'].includes(rank)
    );
    if (highPairs.length > 0) return { hand: 'Jacks or Better', payout: payTable['Jacks or Better'][bet - 1] };
    
    return { hand: '', payout: 0 };
  };

  // Double Up Feature
  const startDoubleUp = () => {
    const deck = shuffleDeck(createDeck());
    setDoubleUpCard(deck[0]);
    setGamePhase('doubleUp');
    setDoubleUpChoice('');
    setShowDoubleResult(false);
    setDoubleUpFlipping(false);
    setDoubleUpHistory([]); // Limpiar historial
    setDoubleUpRound(1); // Primera ronda
  };

  const makeDoubleChoice = (choice) => {
    setDoubleUpChoice(choice);
    setDoubleUpFlipping(true);
    
    // Double up card flip animation
    setTimeout(() => {
      setShowDoubleResult(true);
      setDoubleUpFlipping(false);
      
      const isRed = ['♥', '♦'].includes(doubleUpCard.suit);
      const isCorrect = (choice === 'red' && isRed) || (choice === 'black' && !isRed);
      
      setTimeout(() => {
        if (isCorrect) {
          // Agregar carta ganadora al historial
          setDoubleUpHistory(prev => [...prev, { card: doubleUpCard, choice, correct: true }]);
          setLastWin(lastWin * 2);
          
          // Preparar siguiente ronda automáticamente si no hemos llegado al límite
          if (doubleUpRound < 5) {
            setTimeout(() => {
              const newDeck = shuffleDeck(createDeck());
              setDoubleUpCard(newDeck[0]);
              setDoubleUpChoice('');
              setShowDoubleResult(false);
              setDoubleUpFlipping(false);
              setDoubleUpRound(doubleUpRound + 1);
            }, 1500);
          } else {
            // Máximo alcanzado, mostrar mensaje pero mantener interfaz
            setTimeout(() => {
              setDoubleUpChoice('');
              setShowDoubleResult(false);
              setDoubleUpFlipping(false);
            }, 2000);
          }
        } else {
          // Perdió, agregar al historial y terminar
          setDoubleUpHistory(prev => [...prev, { card: doubleUpCard, choice, correct: false }]);
          setLastWin(0);
          setTimeout(() => {
            setGamePhase('betting');
            setDoubleUpHistory([]);
            setDoubleUpRound(0);
          }, 2000);
        }
      }, 1000);
    }, 600);
  };

  const collectWinnings = () => {
    setChips(chips + lastWin);
    setLastWin(0);
    setGamePhase('betting');
    setDoubleUpHistory([]);
    setDoubleUpRound(0);
  };

  const newGame = () => {
    setGamePhase('betting');
    setHeldCards([false, false, false, false, false]);
    setRevealedCards([false, false, false, false, false]);
    setLastWin(0);
    setWinningHand('');
    setIsDealing(false);
    setIsDrawing(false);
  };

  const addChips = () => {
    setChips(chips + 1000);
  };
  
  // Sistema de Sugerencias Inteligentes (CORRECCIÓN FINAL)
  const analyzeHandForSuggestions = (hand) => {
    const suggestions = [false, false, false, false, false];
    const rankCounts = {};
    const suitCounts = {};
    const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    
    // Contar rangos y palos
    hand.forEach(card => {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    // Verificar si ya tiene una mano ganadora QUE NO SE PUEDE MEJORAR
    const result = evaluateHand(hand);
    
    // Solo mantener todas las cartas si es una mano que NO se puede mejorar:
    // Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight
    if (result.payout > 0 && 
        ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight'].includes(result.hand)) {
      return [true, true, true, true, true];
    }

    // 1. PRIORIDAD ALTA: Cuatro de una clase
    const fourOfAKind = Object.entries(rankCounts).find(([rank, count]) => count === 4);
    if (fourOfAKind) {
      const fourRank = fourOfAKind[0];
      hand.forEach((card, index) => {
        if (card.rank === fourRank) {
          suggestions[index] = true;
        }
      });
      return suggestions;
    }

    // 2. PRIORIDAD ALTA: Tres de una clase
    const threeOfAKind = Object.entries(rankCounts).find(([rank, count]) => count === 3);
    if (threeOfAKind) {
      const threeRank = threeOfAKind[0];
      hand.forEach((card, index) => {
        if (card.rank === threeRank) {
          suggestions[index] = true;
        }
      });
      return suggestions;
    }

    // 3. PRIORIDAD ALTA: Two Pair - Mantener solo los pares (buscar Full House)
    const pairs = Object.entries(rankCounts).filter(([rank, count]) => count === 2);
    if (pairs.length === 2) {
      const pairRank1 = pairs[0][0];
      const pairRank2 = pairs[1][0];
      hand.forEach((card, index) => {
        if (card.rank === pairRank1 || card.rank === pairRank2) {
          suggestions[index] = true;
        }
      });
      return suggestions;
    }

    // 4. PRIORIDAD ALTA: Un par (tanto alto como bajo) - Mantener solo el par
    const allPairs = Object.entries(rankCounts).filter(([rank, count]) => count === 2);
    if (allPairs.length === 1) {
      const pairRank = allPairs[0][0];
      hand.forEach((card, index) => {
        if (card.rank === pairRank) {
          suggestions[index] = true;
        }
      });
      return suggestions;
    }

    // 5. PRIORIDAD ALTA: Cuatro cartas para escalera real
    const sortedRanks = hand.map(card => rankValues[card.rank]).sort((a, b) => a - b);
    const royalRanks = [10, 11, 12, 13, 14]; // 10, J, Q, K, A
    const royalMatches = hand.filter(card => royalRanks.includes(rankValues[card.rank]));
    
    if (royalMatches.length >= 4) {
      // Verificar si es del mismo palo
      const royalSuits = {};
      royalMatches.forEach(card => {
        royalSuits[card.suit] = (royalSuits[card.suit] || 0) + 1;
      });
      
      const mainSuit = Object.entries(royalSuits).find(([suit, count]) => count >= 4);
      if (mainSuit) {
        hand.forEach((card, index) => {
          if (royalRanks.includes(rankValues[card.rank]) && card.suit === mainSuit[0]) {
            suggestions[index] = true;
          }
        });
        return suggestions;
      }
    }

    // 6. PRIORIDAD MEDIA: Cuatro cartas para escalera
    // Verificar escaleras posibles (4 cartas consecutivas)
    for (let i = 0; i <= sortedRanks.length - 4; i++) {
      let consecutive = 1;
      const baseRank = sortedRanks[i];
      const straightCards = [baseRank];
      
      for (let j = i + 1; j < sortedRanks.length; j++) {
        if (sortedRanks[j] === straightCards[straightCards.length - 1] + 1) {
          straightCards.push(sortedRanks[j]);
          consecutive++;
        }
      }
      
      if (consecutive >= 4) {
        hand.forEach((card, index) => {
          if (straightCards.includes(rankValues[card.rank])) {
            suggestions[index] = true;
          }
        });
        return suggestions;
      }
    }

    // 7. PRIORIDAD MEDIA: Cuatro cartas del mismo palo (posible flush)
    const flushSuit = Object.entries(suitCounts).find(([suit, count]) => count >= 4);
    if (flushSuit) {
      hand.forEach((card, index) => {
        if (card.suit === flushSuit[0]) {
          suggestions[index] = true;
        }
      });
      return suggestions;
    }

    // 8. PRIORIDAD BAJA: Tres cartas para escalera real
    if (royalMatches.length >= 3) {
      const royalSuits = {};
      royalMatches.forEach(card => {
        royalSuits[card.suit] = (royalSuits[card.suit] || 0) + 1;
      });
      
      const mainSuit = Object.entries(royalSuits).find(([suit, count]) => count >= 3);
      if (mainSuit) {
        hand.forEach((card, index) => {
          if (royalRanks.includes(rankValues[card.rank]) && card.suit === mainSuit[0]) {
            suggestions[index] = true;
          }
        });
        return suggestions;
      }
    }

    // 9. PRIORIDAD BAJA: Cartas altas sueltas (J, Q, K, A)
    const highCards = hand.filter(card => ['J', 'Q', 'K', 'A'].includes(card.rank));
    if (highCards.length > 0) {
      // Mantener máximo 2 cartas altas del mismo palo o las dos más altas
      const sameSuitHighCards = {};
      highCards.forEach(card => {
        sameSuitHighCards[card.suit] = (sameSuitHighCards[card.suit] || 0) + 1;
      });
      
      const bestSuit = Object.entries(sameSuitHighCards).reduce((a, b) => a[1] > b[1] ? a : b);
      
      if (bestSuit[1] >= 2) {
        // Mantener cartas altas del mismo palo
        hand.forEach((card, index) => {
          if (['J', 'Q', 'K', 'A'].includes(card.rank) && card.suit === bestSuit[0]) {
            suggestions[index] = true;
          }
        });
      } else {
        // Mantener las dos cartas más altas
        const sortedHighCards = highCards
          .map(card => ({ card, value: rankValues[card.rank] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 2);
        
        hand.forEach((card, index) => {
          if (sortedHighCards.some(hc => hc.card.rank === card.rank && hc.card.suit === card.suit)) {
            suggestions[index] = true;
          }
        });
      }
      return suggestions;
    }

    // Si no hay nada bueno, no sugerir ninguna carta (cambiar todas)
    return suggestions;
  };

  // Función para aplicar sugerencias automáticamente
  const applySuggestions = () => {
    if (gamePhase !== 'dealt') return;
    
    const suggestions = analyzeHandForSuggestions(cards);
    setHeldCards(suggestions);
  };

  // Función para limpiar sugerencias
  const clearSuggestions = () => {
    if (gamePhase !== 'dealt') return;
    setHeldCards([false, false, false, false, false]);
  };

  // Card Component (MEJORADO - Más grande y nítido)
  const Card = ({ card, isHeld, onClick, isRevealed = true }) => {
    const cardBack = React.createElement('div', {
      className: 'absolute inset-0 rounded-xl flex items-center justify-center border-3 border-blue-600 overflow-hidden',
      style: { 
        backfaceVisibility: 'hidden', 
        transform: 'rotateY(180deg)',
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #1e40af, #1e3a8a)',
        backgroundSize: '400% 400%',
        animation: 'gradient 6s ease infinite'
      }
    }, [
      // Patrón de fondo con círculos
      React.createElement('div', {
        key: 'pattern',
        className: 'absolute inset-0',
        style: {
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 25% 75%, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 75% 25%, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }
      })
    ]);

    const cardFront = React.createElement('div', {
      className: `absolute inset-0 bg-white rounded-xl shadow-2xl border-3 border-gray-400 flex flex-col justify-between p-3 ${
        card && ['♥', '♦'].includes(card.suit) ? 'text-red-600' : 'text-black'
      }`,
      style: { 
        backfaceVisibility: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
      }
    }, card ? [
      React.createElement('div', {
        key: 'top-rank',
        className: 'text-lg sm:text-xl lg:text-2xl font-bold leading-none'
      }, card.rank),
      React.createElement('div', {
        key: 'center-suit',
        className: 'text-3xl sm:text-4xl lg:text-5xl text-center leading-none',
        style: {
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }
      }, card.suit),
      React.createElement('div', {
        key: 'bottom-rank',
        className: 'text-lg sm:text-xl lg:text-2xl font-bold transform rotate-180 self-end leading-none'
      }, card.rank)
    ] : []);

    return React.createElement('div', {
      className: `relative w-20 h-28 sm:w-24 sm:h-36 lg:w-28 lg:h-40 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isHeld 
          ? 'ring-4 ring-yellow-400 -translate-y-2 lg:-translate-y-3 shadow-yellow-400/30 shadow-lg' 
          : 'hover:shadow-xl'
      }`,
      onClick: onClick,
      style: { perspective: '1000px' }
    }, [
      React.createElement('div', {
        key: 'card-inner',
        className: 'relative w-full h-full transition-transform duration-600',
        style: { 
          transformStyle: 'preserve-3d',
          transform: !isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }
      }, [
        React.cloneElement(cardFront, { key: 'card-front' }),
        React.cloneElement(cardBack, { key: 'card-back' })
      ]),
      
      // Indicador de carta sugerida (mejorado)
      isHeld && React.createElement('div', {
        key: 'suggestion-indicator',
        className: 'absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 border-3 border-white rounded-full flex items-center justify-center text-black font-bold text-sm animate-pulse',
        style: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }
      }, '💡'),
      
      // Etiqueta "HOLD" mejorada
      isHeld && React.createElement('div', {
        key: 'hold-label',
        className: 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black font-bold px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm border-2 border-white',
        style: {
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }
      }, 'HOLD')
    ]);
  };

// Interfaz Moderna de Doblar (MODAL + DISEÑO ORIGINAL ESPECTACULAR)
  const ModernDoubleUpScreen = () => {
    return React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4',
      style: {
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }
    }, [
      // Modal Container con efecto cristal + gradiente futurista
      React.createElement('div', {
        key: 'modal-container',
        className: 'relative w-full max-w-4xl max-h-[90vh] overflow-y-auto',
        style: {
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(88, 28, 135, 0.95), rgba(0, 0, 0, 0.95))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(6, 182, 212, 0.2)'
        }
      }, [
        // Efectos de fondo futuristas
        React.createElement('div', {
          key: 'bg-effects',
          className: 'absolute inset-0 rounded-3xl overflow-hidden pointer-events-none'
        }, [
          // Partículas brillantes
          Array.from({ length: 15 }, (_, i) => 
            React.createElement('div', {
              key: `particle-${i}`,
              className: 'absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse',
              style: {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.6
              }
            })
          )
        ]),
        
        // Botón de cerrar espectacular
        React.createElement('button', {
          key: 'close-button',
          onClick: collectWinnings,
          className: 'absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl transition-all duration-300 z-10 border border-red-400/50',
          style: {
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
          }
        }, '×'),
        
        // Header futurista original
        React.createElement('div', {
          key: 'modal-header',
          className: 'relative z-10 p-4'
        }, [
          React.createElement('div', {
            key: 'header-bg',
            className: 'bg-black/30 backdrop-blur-lg rounded-3xl p-4 border border-cyan-500/30 mb-4',
            style: {
              boxShadow: '0 8px 32px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }
          }, [
            React.createElement('h1', {
              key: 'modal-title',
              className: 'text-2xl font-bold text-center mb-3',
              style: {
                background: 'linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(6, 182, 212, 0.5)'
              }
            }, '⚡ RONDA DE DOBLAR ⚡'),
            
            React.createElement('div', {
              key: 'info-cards',
              className: 'grid grid-cols-3 gap-2'
            }, [
              React.createElement('div', {
                key: 'round-info',
                className: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-2 border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300',
                style: {
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
                }
              }, [
                React.createElement('div', {
                  key: 'round-label',
                  className: 'text-cyan-400 text-xs font-bold'
                }, 'RONDA'),
                React.createElement('div', {
                  key: 'round-value',
                  className: 'text-white text-lg font-bold'
                }, `${doubleUpRound}/5`)
              ]),
              React.createElement('div', {
                key: 'current-info',
                className: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-2 border border-green-400/30 hover:border-green-400/60 transition-all duration-300',
                style: {
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
                }
              }, [
                React.createElement('div', {
                  key: 'current-label',
                  className: 'text-green-400 text-xs font-bold'
                }, 'GANANCIA ACTUAL'),
                React.createElement('div', {
                  key: 'current-value',
                  className: 'text-white text-lg font-bold'
                }, `${lastWin}`)
              ]),
              React.createElement('div', {
                key: 'potential-info',
                className: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-2 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300',
                style: {
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
                }
              }, [
                React.createElement('div', {
                  key: 'potential-label',
                  className: 'text-yellow-400 text-xs font-bold'
                }, 'POTENCIAL MÁXIMO'),
                React.createElement('div', {
                  key: 'potential-value',
                  className: 'text-white text-lg font-bold'
                }, `${lastWin * Math.pow(2, 5 - doubleUpRound)}`)
              ])
            ])
          ])
        ]),

        // Área principal de juego
        React.createElement('div', {
          key: 'main-game-area',
          className: 'flex flex-col items-center justify-center px-4 pb-4'
        }, [
          // Carta principal con efectos 3D espectaculares
          React.createElement('div', {
            key: 'main-card-container',
            className: 'relative mb-6'
          }, [
            React.createElement('div', {
              key: 'card-glow',
              className: 'absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur-xl scale-110'
            }),
            React.createElement('div', {
              key: 'main-card',
              className: 'relative w-32 h-44 transform transition-all duration-600',
              style: {
                perspective: '1000px'
              }
            }, [
              React.createElement('div', {
                key: 'card-inner-modern',
                className: 'relative w-full h-full transition-transform duration-600',
                style: {
                  transformStyle: 'preserve-3d',
                  transform: showDoubleResult ? 'rotateY(0deg)' : 'rotateY(180deg)'
                }
              }, [
                // Frente de la carta
                React.createElement('div', {
                  key: 'card-front-modern',
                  className: `absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-2xl border-3 ${doubleUpCard && ['♥', '♦'].includes(doubleUpCard.suit) ? 'border-red-500' : 'border-gray-800'} flex flex-col justify-between p-3`,
                  style: {
                    backfaceVisibility: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }
                }, doubleUpCard ? [
                  React.createElement('div', {
                    key: 'top-rank-modern',
                    className: `text-2xl font-bold ${doubleUpCard && ['♥', '♦'].includes(doubleUpCard.suit) ? 'text-red-600' : 'text-black'}`
                  }, doubleUpCard.rank),
                  React.createElement('div', {
                    key: 'center-suit-modern',
                    className: `text-5xl text-center ${doubleUpCard && ['♥', '♦'].includes(doubleUpCard.suit) ? 'text-red-600' : 'text-black'}`,
                    style: {
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }
                  }, doubleUpCard.suit),
                  React.createElement('div', {
                    key: 'bottom-rank-modern',
                    className: `text-2xl font-bold transform rotate-180 self-end ${doubleUpCard && ['♥', '♦'].includes(doubleUpCard.suit) ? 'text-red-600' : 'text-black'}`
                  }, doubleUpCard.rank)
                ] : []),
                
                // Parte trasera de la carta
                React.createElement('div', {
                  key: 'card-back-modern',
                  className: 'absolute inset-0 bg-gradient-to-br from-blue-800 to-purple-900 rounded-xl shadow-2xl border-3 border-cyan-500 flex items-center justify-center',
                  style: {
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    boxShadow: '0 20px 40px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }
                }, [
                  React.createElement('div', {
                    key: 'back-pattern',
                    className: 'text-cyan-400 text-5xl opacity-80'
                  }, '⚡')
                ])
              ])
            ])
          ]),

          // Spinner futurista durante el volteo
          doubleUpFlipping && React.createElement('div', {
            key: 'futuristic-spinner',
            className: 'mb-4'
          }, [
            React.createElement('div', {
              key: 'spinner-container',
              className: 'relative w-12 h-12'
            }, [
              React.createElement('div', {
                key: 'spinner-ring1',
                className: 'absolute inset-0 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin'
              }),
              React.createElement('div', {
                key: 'spinner-ring2',
                className: 'absolute inset-2 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin',
                style: { animationDirection: 'reverse', animationDuration: '0.8s' }
              }),
              React.createElement('div', {
                key: 'spinner-core',
                className: 'absolute inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse'
              })
            ])
          ]),

          // Resultado espectacular
          showDoubleResult && React.createElement('div', {
            key: 'result-display',
            className: 'mb-4 text-center'
          }, [
            React.createElement('div', {
              key: 'result-message',
              className: `text-4xl font-bold mb-2 animate-bounce ${
                (['♥', '♦'].includes(doubleUpCard.suit) && doubleUpChoice === 'red') || 
                (['♠', '♣'].includes(doubleUpCard.suit) && doubleUpChoice === 'black')
                  ? 'text-green-400'
                  : 'text-red-500'
              }`,
              style: {
                textShadow: '0 0 20px currentColor'
              }
            }, (
              (['♥', '♦'].includes(doubleUpCard.suit) && doubleUpChoice === 'red') || 
              (['♠', '♣'].includes(doubleUpCard.suit) && doubleUpChoice === 'black')
            ) ? '🎉 ¡GANASTE! 🎉' : '💥 YA ERA !!! 💥'),
            React.createElement('div', {
              key: 'win-amount-display',
              className: 'text-xl font-bold text-yellow-400'
            }, `Ganancia: ${lastWin}`)
          ]),

          // Botones espectaculares originales
          !showDoubleResult && !doubleUpFlipping && React.createElement('div', {
            key: 'choice-buttons',
            className: 'flex gap-3 mb-4'
          }, [
            React.createElement('button', {
              key: 'red-button',
              onClick: () => makeDoubleChoice('red'),
              className: 'group relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold text-white text-base transition-all duration-300 hover:scale-110 hover:shadow-2xl',
              style: {
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }
            }, [
              React.createElement('div', {
                key: 'red-bg-glow',
                className: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse transition-all duration-300'
              }),
              React.createElement('div', {
                key: 'red-content',
                className: 'relative z-10 flex items-center gap-1.5'
              }, [
                React.createElement('span', {
                  key: 'red-icon',
                  className: 'text-lg'
                }, '♥'),
                React.createElement('span', {
                  key: 'red-text',
                  className: 'font-bold tracking-wide'
                }, 'ROJO')
              ])
            ]),
            React.createElement('button', {
              key: 'black-button',
              onClick: () => makeDoubleChoice('black'),
              className: 'group relative px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg font-bold text-white text-base transition-all duration-300 hover:scale-110 hover:shadow-2xl',
              style: {
                boxShadow: '0 8px 25px rgba(75, 85, 99, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }
            }, [
              React.createElement('div', {
                key: 'black-bg-glow',
                className: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse transition-all duration-300'
              }),
              React.createElement('div', {
                key: 'black-content',
                className: 'relative z-10 flex items-center gap-1.5'
              }, [
                React.createElement('span', {
                  key: 'black-icon',
                  className: 'text-lg'
                }, '♠'),
                React.createElement('span', {
                  key: 'black-text',
                  className: 'font-bold tracking-wide'
                }, 'NEGRO')
              ])
            ])
          ]),

          // Botón de cobrar espectacular
          React.createElement('button', {
            key: 'collect-button-modern',
            onClick: collectWinnings,
            className: 'group relative px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-bold text-white text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl',
            style: {
              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            }
          }, [
            React.createElement('div', {
              key: 'collect-bg-glow',
              className: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse transition-all duration-300'
            }),
            React.createElement('div', {
              key: 'collect-content',
              className: 'relative z-10 flex items-center gap-1.5'
            }, [
              React.createElement('span', {
                key: 'collect-icon',
                className: 'text-lg'
              }, '💰'),
              React.createElement('span', {
                key: 'collect-text',
                className: 'font-bold tracking-wide'
              }, 'COBRAR')
            ])
          ]),

          // Mensaje si se alcanzó el máximo
          doubleUpRound >= 5 && React.createElement('div', {
            key: 'max-reached-modern',
            className: 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/50 rounded-xl p-4 text-yellow-400 font-bold text-lg flex items-center gap-2 mt-4',
            style: {
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
            }
          }, [
            React.createElement('span', {
              key: 'max-icon',
              className: 'text-2xl'
            }, '🏆'),
            React.createElement('span', {
              key: 'max-text'
            }, '¡Máximo de 5 dobles alcanzado!')
          ])
        ])
      ])
    ]);
  };
  
  // Main Render (REDISEÑADO - Layout optimizado)
  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-black p-4 relative overflow-hidden'
  }, [
    // Escudo en bajo relieve como marca de agua
    React.createElement('div', {
      key: 'background-shield',
      className: 'absolute inset-0 flex items-center justify-center pointer-events-none'
    }, [
      React.createElement('img', {
        key: 'shield-watermark',
        src: 'assets/escudomuchacha.png',
        alt: '',
        className: 'w-96 h-96 object-contain transform rotate-12',
        style: {
          opacity: 0.08,
          filter: 'grayscale(100%) contrast(150%) brightness(0.7)',
          mixBlendMode: 'overlay',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)'
        }
      })
    ]),
    
    // Layout principal con sidebar
    React.createElement('div', {
      key: 'main-layout',
      className: 'max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6'
    }, [
      // Sidebar con tabla de pagos (solo en desktop)
      React.createElement('div', {
        key: 'sidebar',
        className: 'hidden lg:block lg:col-span-1'
      }, [
        React.createElement('div', {
          key: 'pay-table-sidebar',
          className: 'bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30 sticky top-4',
          style: {
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }
        }, [
          React.createElement('h3', {
            key: 'pay-title-sidebar',
            className: 'text-yellow-400 font-bold text-center mb-4 text-lg'
          }, 'TABLA DE PAGOS'),
          React.createElement('div', {
            key: 'pay-list-sidebar',
            className: 'space-y-2'
          }, Object.entries(payTable).map(([hand, payouts]) => 
            React.createElement('div', {
              key: hand,
              className: 'flex justify-between items-center bg-green-900/50 p-3 rounded-lg border border-green-700/30'
            }, [
              React.createElement('span', {
                key: 'hand-name-sidebar',
                className: 'font-semibold text-white text-sm'
              }, hand),
              React.createElement('span', {
                key: 'payout-sidebar',
                className: 'text-yellow-400 font-bold text-sm'
              }, `${payouts[bet - 1]}x`)
            ])
          ))
        ])
      ]),
      
      // Área principal del juego
      React.createElement('div', {
        key: 'game-area',
        className: 'lg:col-span-3'
      }, [
        // Header
        React.createElement('div', {
          key: 'header',
          className: 'text-center mb-8'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-4xl lg:text-5xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-3'
          }, [
            React.createElement(Trophy, { key: 'trophy1', className: 'w-8 h-8 lg:w-10 lg:h-10' }),
            'Muchacha Grande FC - Video Poker',
            React.createElement(Trophy, { key: 'trophy2', className: 'w-8 h-8 lg:w-10 lg:h-10' })
          ]),
          React.createElement('div', {
            key: 'stats-bar',
            className: 'flex justify-center items-center gap-4 lg:gap-8 text-white flex-wrap'
          }, [
            React.createElement('div', {
              key: 'chips',
              className: 'bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-400/30'
            }, [
              React.createElement('span', {
                key: 'chips-text',
                className: 'text-yellow-400 font-bold text-lg'
              }, `Fichas: ${chips.toLocaleString()}`)
            ]),
            React.createElement('div', {
              key: 'bet',
              className: 'bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-400/30'
            }, [
              React.createElement('span', {
                key: 'bet-text',
                className: 'text-blue-400 font-bold text-lg'
              }, `Apuesta: ${bet}`)
            ])
          ])
        ]),

        // Tabla de pagos compacta para móvil
        React.createElement('div', {
          key: 'pay-table-mobile',
          className: 'lg:hidden bg-black/70 backdrop-blur-sm rounded-xl p-3 mb-4 border border-yellow-400/20'
        }, [
          React.createElement('h3', {
            key: 'pay-title-mobile',
            className: 'text-yellow-400 font-bold text-center mb-2 text-base'
          }, 'TABLA DE PAGOS'),
          React.createElement('div', {
            key: 'pay-grid-mobile',
            className: 'grid grid-cols-1 gap-1 text-xs text-white'
          }, [
            // Solo mostrar las 4 manos más importantes en móvil
            React.createElement('div', {
              key: 'royal-mobile',
              className: 'flex justify-between bg-gradient-to-r from-yellow-600/50 to-yellow-700/50 p-2 rounded border border-yellow-400/30'
            }, [
              React.createElement('span', {
                key: 'royal-name',
                className: 'font-bold text-yellow-300'
              }, '🌟 Royal Flush'),
              React.createElement('span', {
                key: 'royal-payout',
                className: 'text-yellow-400 font-bold'
              }, `${payTable['Royal Flush'][bet - 1]}x`)
            ]),
            React.createElement('div', {
              key: 'four-mobile',
              className: 'flex justify-between bg-green-900/50 p-2 rounded border border-green-700/30'
            }, [
              React.createElement('span', {
                key: 'four-name',
                className: 'font-semibold'
              }, '💎 Four of a Kind'),
              React.createElement('span', {
                key: 'four-payout',
                className: 'text-yellow-400 font-bold'
              }, `${payTable['Four of a Kind'][bet - 1]}x`)
            ]),
            React.createElement('div', {
              key: 'full-mobile',
              className: 'flex justify-between bg-green-900/50 p-2 rounded border border-green-700/30'
            }, [
              React.createElement('span', {
                key: 'full-name',
                className: 'font-semibold'
              }, '🏠 Full House'),
              React.createElement('span', {
                key: 'full-payout',
                className: 'text-yellow-400 font-bold'
              }, `${payTable['Full House'][bet - 1]}x`)
            ]),
            React.createElement('div', {
              key: 'jacks-mobile',
              className: 'flex justify-between bg-green-900/50 p-2 rounded border border-green-700/30'
            }, [
              React.createElement('span', {
                key: 'jacks-name',
                className: 'font-semibold'
              }, '🃏 Jacks or Better'),
              React.createElement('span', {
                key: 'jacks-payout',
                className: 'text-yellow-400 font-bold'
              }, `${payTable['Jacks or Better'][bet - 1]}x`)
            ])
          ])
        ]),

        gamePhase === 'doubleUp' ? 
          React.createElement(ModernDoubleUpScreen, { key: 'modern-double-screen' }) :
          React.createElement('div', { key: 'main-game' }, [
            // Área de cartas más prominente
            React.createElement('div', {
              key: 'cards-section',
              className: 'bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10 pt-12 lg:pt-16',
              style: {
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }
            }, [
              React.createElement('div', {
                key: 'cards-container',
                className: 'flex justify-center gap-2 lg:gap-6 mb-4 lg:mb-6 overflow-x-auto px-2'
              }, cards.length > 0 ? 
                cards.map((card, index) => 
                  React.createElement(Card, {
                    key: index,
                    card: card,
                    isHeld: heldCards[index],
                    onClick: () => toggleHold(index),
                    isRevealed: revealedCards[index]
                  })
                ) :
                Array.from({ length: 5 }, (_, index) => 
                  React.createElement(Card, {
                    key: index,
                    isRevealed: false
                  })
                )
              ),

              winningHand && React.createElement('div', {
                key: 'game-status',
                className: 'text-center mb-4'
              }, [
                React.createElement('div', {
                  key: 'win-message',
                  className: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 px-8 rounded-xl inline-block text-xl shadow-lg',
                  style: {
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
                  }
                }, `¡${winningHand}! - Ganaste ${lastWin} fichas`)
              ])
            ]),

            // Controles del juego
            React.createElement('div', {
              key: 'controls',
              className: 'flex justify-center gap-2 lg:gap-4 mb-4 lg:mb-6 flex-wrap px-2'
            }, [
              gamePhase === 'betting' && React.createElement('div', {
                key: 'betting-controls',
                className: 'flex gap-4 items-center flex-wrap justify-center'
              }, [
                React.createElement('div', {
                  key: 'bet-selector',
                  className: 'flex items-center gap-2'
                }, [
                  React.createElement('label', {
                    key: 'bet-label',
                    className: 'text-white font-bold text-lg'
                  }, 'Apuesta:'),
                  React.createElement('select', {
                    key: 'bet-select',
                    value: bet,
                    onChange: (e) => setBet(Number(e.target.value)),
                    className: 'bg-black/80 text-white px-4 py-2 rounded-lg border border-white/30 text-lg font-bold'
                  }, [1, 2, 3, 4, 5].map(value => 
                    React.createElement('option', {
                      key: value,
                      value: value
                    }, value)
                  ))
                ]),
                React.createElement('button', {
                  key: 'deal-button',
                  onClick: dealCards,
                  disabled: chips < bet || isDealing,
                  className: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-4 lg:py-3 lg:px-8 rounded-xl flex items-center gap-2 lg:gap-3 transition-all duration-300 shadow-lg text-sm lg:text-lg',
                  style: {
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                    minHeight: '44px' // Tamaño mínimo para toque
                  }
                }, [
                  React.createElement(Shuffle, { key: 'shuffle-icon', className: 'w-6 h-6' }),
                  isDealing ? 'REPARTIENDO...' : 'DEAL'
                ]),
                React.createElement('button', {
                  key: 'max-bet-button',
                  onClick: () => setBet(5),
                  disabled: chips < 5,
                  className: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg text-lg',
                  style: {
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
                  }
                }, 'MAX BET')
              ]),

              gamePhase === 'dealt' && React.createElement('div', {
                key: 'dealt-controls',
                className: 'flex gap-4 items-center flex-wrap justify-center'
              }, [
                React.createElement('button', {
                  key: 'draw-button',
                  onClick: drawCards,
                  disabled: isDrawing,
                  className: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg text-lg',
                  style: {
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)'
                  }
                }, [
                  React.createElement(Play, { key: 'play-icon', className: 'w-6 h-6' }),
                  isDrawing ? 'CAMBIANDO...' : 'DRAW'
                ]),
                React.createElement('button', {
                  key: 'suggest-button',
                  onClick: applySuggestions,
                  className: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg'
                }, [
                  React.createElement('span', { key: 'suggest-icon', className: 'text-xl' }, '💡'),
                  'SUGERIR'
                ]),
                React.createElement('button', {
                  key: 'clear-button',
                  onClick: clearSuggestions,
                  className: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg'
                }, [
                  React.createElement('span', { key: 'clear-icon', className: 'text-xl' }, '🗑️'),
                  'LIMPIAR'
                ])
              ]),

              gamePhase === 'drawn' && React.createElement('div', {
                key: 'drawn-controls',
                className: 'flex gap-4 flex-wrap justify-center'
              }, [
                lastWin > 0 && React.createElement('button', {
                  key: 'double-button',
                  onClick: startDoubleUp,
                  className: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg text-lg',
                  style: {
                    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
                  }
                }, 'DOBLAR'),
                React.createElement('button', {
                  key: 'collect-button',
                  onClick: () => {
                    if (lastWin > 0) collectWinnings();
                    else newGame();
                  },
                  className: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg text-lg',
                  style: {
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
                  }
                }, [
                  React.createElement(RotateCcw, { key: 'rotate-icon', className: 'w-6 h-6' }),
                  lastWin > 0 ? 'COBRAR' : 'NUEVA MANO'
                ])
              ])
            ]),

            React.createElement('div', {
              key: 'instructions',
              className: 'text-center text-white'
            }, [
              gamePhase === 'betting' && !isDealing && React.createElement('p', {
                key: 'betting-instruction',
                className: 'text-lg'
              }, 'Selecciona tu apuesta y presiona DEAL para comenzar'),
              isDealing && React.createElement('p', {
                key: 'dealing-instruction',
                className: 'animate-pulse text-lg'
              }, 'Repartiendo cartas...'),
              gamePhase === 'dealt' && !isDrawing && React.createElement('p', {
                key: 'dealt-instruction',
                className: 'text-lg'
              }, 'Haz clic en las cartas que quieres mantener, luego presiona DRAW'),
              isDrawing && React.createElement('p', {
                key: 'drawing-instruction',
                className: 'animate-pulse text-lg'
              }, 'Cambiando cartas...'),
              gamePhase === 'drawn' && lastWin > 0 && React.createElement('p', {
                key: 'drawn-instruction',
                className: 'text-lg'
              }, '¡Puedes DOBLAR tu ganancia apostando a rojo o negro, o COBRAR de inmediato!')
            ])
          ])
      ])
    ]),

    // Controles inferiores
    React.createElement('div', {
      key: 'bottom-controls',
      className: 'fixed bottom-4 right-4 flex gap-4 z-50'
    }, [
      // Botón de sonidos (TOGGLE simple)
      React.createElement('button', {
        key: 'sound-toggle-button',
        onClick: toggleSounds,
        className: 'w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 text-white transition-all duration-300 shadow-lg flex items-center justify-center',
        title: soundsEnabled ? 'Desactivar sonidos' : 'Activar sonidos'
      }, [
        React.createElement('span', {
          key: 'sound-icon',
          className: 'text-xl'
        }, soundsEnabled ? '🔊' : '🔇')
      ]),
      chips < 100 && React.createElement('button', {
        key: 'add-chips-button',
        onClick: addChips,
        className: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg'
      }, 'Agregar 1000 Fichas')
      // Indicador de estadísticas comentado - se puede descomentar si se necesita
      /*
      React.createElement('div', {
        key: 'stats-display',
        className: 'text-white text-sm bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20'
      }, [
        React.createElement('div', { key: 'total-won' }, `Total: ${stats.totalWon.toLocaleString()}`),
        React.createElement('div', { key: 'biggest-win' }, `Mejor: ${stats.biggestWin.toLocaleString()}`)
      ])
      */
    ])
  ]);
};

// Render the app with React 18 + Error Boundary
const container = document.getElementById('root');
if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(VideoPoker));
    console.log('✅ Juego cargado correctamente');
    
    // Ocultar pantalla de carga inmediatamente después del render exitoso
    setTimeout(hideLoadingScreen, 500);
    
  } catch (error) {
    console.error('❌ Error al renderizar:', error);
    container.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error al cargar el juego. Por favor, recarga la página.</div>';
  }
} else {
  console.error('❌ No se encontró el elemento root');
}

// Hide loading screen when app loads - MÚLTIPLES MÉTODOS
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading');
  if (loadingScreen) {
    console.log('🚀 Ocultando pantalla de carga...');
    loadingScreen.style.transition = 'opacity 0.5s ease-out';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      console.log('✅ Pantalla de carga ocultada');
    }, 500);
  } else {
    console.warn('⚠️ No se encontró el elemento loading');
  }
}

// Múltiples triggers para asegurar que se oculte
window.addEventListener('load', () => {
  console.log('📱 Window load event triggered');
  setTimeout(hideLoadingScreen, 1500);
});

// Backup: DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOMContentLoaded triggered');
  setTimeout(hideLoadingScreen, 2000);
});

// Backup: React loaded
if (typeof React !== 'undefined') {
  console.log('⚛️ React detected, hiding loading screen');
  setTimeout(hideLoadingScreen, 2500);
}

// Fallback: Force hide after 5 seconds
setTimeout(() => {
  console.log('⏰ Fallback: Forcing loading screen hide after 5s');
  hideLoadingScreen();
}, 5000);