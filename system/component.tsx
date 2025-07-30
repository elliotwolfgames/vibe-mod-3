import { useCallback, useEffect, useState, useRef } from 'react';
import { ActionMap, ChildModuleCommunicator, initModule, ResultPayload, ModuleResultType, AspectPermissions, AspectPermissionType } from 'wolfy-module-kit';

// DO NOT MODIFY FROZEN REGION BELOW
// region Frozen
import moduleConfig, { type ModuleConfig } from './configuration';
import { ModuleOperation, ModuleOperationType } from './operation';
import { originConfig } from './origins';
import { interpretResult } from './result-interpretation';
// endregion Frozen

// Game-specific imports
import { GameRoom, ClueData, HiddenObject, getRoomById, getCriticalCluesCount } from './gameData';

// Game state types
interface GameState {
  status: 'loading' | 'playing' | 'paused' | 'completed' | 'failed';
  startTime: number;
  currentTime: number;
  timeRemaining: number | null;
  hintsRemaining: number;
  currentHint: string | null;
  selectedClue: ClueData | null;
  showCaseSummary: boolean;
  totalClicks: number;
  accuracy: number;
}

interface GameCompletionState {
  status: 'incomplete' | 'partial' | 'complete' | 'perfect';
  completionType: 'solved' | 'timeout' | 'gave_up' | 'failed';
  score: number;
  accuracy: number;
  completionTime: number;
  hintsUsed: number;
  criticalCluesFound: number;
  totalCriticalClues: number;
}

const Component = ({ }) => {

  // DO NOT MODIFY FROZEN REGION BELOW
  // region Frozen
  const [moduleCommunicator, setModuleCommunicator] = useState<ChildModuleCommunicator | null>(null);
  const [resultHandler, setResultHandler] = useState<((payload: ResultPayload<ModuleConfig>) => void) | null>(null);
  const [config, setConfig] = useState<ModuleConfig | null>(null);
  const [moduleUid, setModuleUid] = useState<string | null>(null)

  const [actions, setActions] = useState<ActionMap>({})
  const [aspectsPermissions, setAspectsPermissions] = useState<AspectPermissions>({});
  const [lastOperation, setLastOperation] = useState<ModuleOperation | null>(null);
  // endregion Frozen

  // Game state
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [discoveredClues, setDiscoveredClues] = useState<ClueData[]>([]);
  const [foundObjects, setFoundObjects] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    startTime: Date.now(),
    currentTime: Date.now(),
    timeRemaining: null,
    hintsRemaining: 3,
    currentHint: null,
    selectedClue: null,
    showCaseSummary: false,
    totalClicks: 0,
    accuracy: 0
  });

  // aspects record
  const [aspects, setAspects] = useState<Record<string, any>>({});

  // Initialize game room when config is available
  useEffect(() => {
    if (config && !gameRoom) {
      const room = getRoomById(config.roomId);
      if (room) {
        setGameRoom(room);
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          startTime: Date.now(),
          hintsRemaining: config.maxHints,
          timeRemaining: config.timerEnabled ? config.timeLimit : null
        }));
      }
    }
  }, [config, gameRoom]);

  // Timer effect
  useEffect(() => {
    if (!config?.timerEnabled || gameState.status !== 'playing' || !gameState.timeRemaining) {
      return;
    }

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining && prev.timeRemaining > 1) {
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        } else {
          // Time expired
          handleGameComplete({ completionType: 'timeout', status: 'failed' });
          return { ...prev, timeRemaining: 0, status: 'failed' };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config?.timerEnabled, gameState.status, gameState.timeRemaining]);

  useEffect(() => {
    if (!lastOperation) {
      return;
    }

    // Custom operations logic
    if (lastOperation.type === ModuleOperationType.SET_TITLE) {
      // Handle title operations if needed
    } else {
      console.warn('Unknown operation type:', lastOperation.type);
    }
  }, [lastOperation]);

  // Game logic functions
  const handleObjectClick = useCallback((objectId: string) => {
    if (!gameRoom || gameState.status !== 'playing') return;

    setGameState(prev => ({ ...prev, totalClicks: prev.totalClicks + 1 }));

    const object = gameRoom.objects.find(obj => obj.id === objectId);
    if (!object || foundObjects.has(objectId)) return;

    // Object found!
    setFoundObjects(prev => new Set(Array.from(prev).concat(objectId)));
    setDiscoveredClues(prev => [...prev, object.clue]);

    // Clear current hint if this was the hinted object
    if (gameState.currentHint === objectId) {
      setGameState(prev => ({ ...prev, currentHint: null }));
    }

    // Check for game completion
    const criticalClues = gameRoom.objects.filter(obj => obj.clue.importance === 'critical');
    const foundCriticalClues = discoveredClues.filter(clue => clue.importance === 'critical').length +
                              (object.clue.importance === 'critical' ? 1 : 0);

    if (foundCriticalClues >= criticalClues.length) {
      handleGameComplete({ completionType: 'solved', status: 'perfect' });
    } else if (foundCriticalClues >= Math.ceil(criticalClues.length * 0.8)) {
      // Check if we should complete with partial success
      const totalFound = foundObjects.size + 1;
      if (totalFound >= gameRoom.objects.length * 0.7) {
        handleGameComplete({ completionType: 'solved', status: 'complete' });
      }
    }
  }, [gameRoom, gameState.status, foundObjects, discoveredClues, gameState.currentHint]);

  const handleHintRequest = useCallback(() => {
    if (!gameRoom || gameState.hintsRemaining <= 0 || gameState.status !== 'playing') return;

    // Find an unfound critical clue
    const unfoundCriticalObjects = gameRoom.objects.filter(obj =>
      !foundObjects.has(obj.id) && obj.clue.importance === 'critical'
    );

    let targetObject = unfoundCriticalObjects[0];
    if (!targetObject) {
      // If no critical clues left, find any unfound object
      const unfoundObjects = gameRoom.objects.filter(obj => !foundObjects.has(obj.id));
      targetObject = unfoundObjects[0];
    }

    if (targetObject) {
      setGameState(prev => ({
        ...prev,
        hintsRemaining: prev.hintsRemaining - 1,
        currentHint: targetObject.id
      }));

      // Clear hint after 5 seconds
      setTimeout(() => {
        setGameState(prev => ({ ...prev, currentHint: null }));
      }, 5000);
    }
  }, [gameRoom, gameState.hintsRemaining, gameState.status, foundObjects]);

  const handleGameComplete = useCallback((completion: { completionType: string; status: string }) => {
    if (!gameRoom || !config) return;

    const completionTime = Date.now() - gameState.startTime;
    const accuracy = gameState.totalClicks > 0 ? foundObjects.size / gameState.totalClicks : 1;
    const criticalCluesFound = discoveredClues.filter(clue => clue.importance === 'critical').length;
    const totalCriticalClues = getCriticalCluesCount(gameRoom);

    const score = calculateScore(discoveredClues, gameRoom, gameState.startTime, gameState.hintsRemaining);

    const completionState: GameCompletionState = {
      status: completion.status as any,
      completionType: completion.completionType as any,
      score,
      accuracy,
      completionTime,
      hintsUsed: config.maxHints - gameState.hintsRemaining,
      criticalCluesFound,
      totalCriticalClues
    };

    setGameState(prev => ({ ...prev, status: 'completed', showCaseSummary: true }));

    // Report results to parent system
    if (resultHandler && actions) {
      const resultData = {
        gameType: 'hidden_object_investigation',
        completed: completion.status !== 'failed',
        score: completionState.score,
        accuracy: completionState.accuracy,
        completionTime: completionState.completionTime,
        hintsUsed: completionState.hintsUsed,
        evidenceFound: completionState.criticalCluesFound,
        totalEvidence: completionState.totalCriticalClues,
        detailsForParent: {
          investigationComplete: completion.status === 'perfect',
          suspectIdentified: criticalCluesFound >= totalCriticalClues * 0.8,
          motiveEstablished: discoveredClues.some(clue => clue.evidenceType === 'financial'),
          confidenceLevel: Math.round((criticalCluesFound / totalCriticalClues) * 100),
          timeExpired: completion.completionType === 'timeout'
        }
      };

      resultHandler({
        data: resultData,
        config,
        actions
      });
    }
  }, [gameRoom, config, gameState.startTime, gameState.hintsRemaining, foundObjects.size, gameState.totalClicks, discoveredClues, resultHandler, actions]);

  const calculateScore = (clues: ClueData[], room: GameRoom, startTime: number, hintsRemaining: number): number => {
    let baseScore = 0;
    
    clues.forEach(clue => {
      switch (clue.importance) {
        case 'critical': baseScore += 1000; break;
        case 'supporting': baseScore += 500; break;
        case 'background': baseScore += 200; break;
        case 'red-herring': baseScore -= 100; break;
      }
    });

    const completionTime = (Date.now() - startTime) / 1000;
    const timeBonus = Math.max(0, 5000 - (completionTime * 10));
    const hintBonus = hintsRemaining * 300;

    return Math.round(baseScore + timeBonus + hintBonus);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const requestAspectChange = useCallback((aspectToChange: string, valueToSet: any) => {
    if (!moduleCommunicator || !aspectsPermissions) return;

    if (aspectsPermissions[aspectToChange] === AspectPermissionType.ReadWrite) {
      moduleCommunicator.requestAspectValueChange(aspectToChange, valueToSet);
    } else {
      console.log(`Module does not have write permission for aspect: ${aspectToChange}`);
    }
  }, [moduleCommunicator, aspectsPermissions]);

  // DO NOT MODIFY FROZEN REGION BELOW
  // region Frozen
  useEffect(() => {
    let communicator: ChildModuleCommunicator | null = null;
    try {
      let currentAspectPermissions: AspectPermissions = {};

      const initCallback = (uid: string, actions: ActionMap, aspects: AspectPermissions) => {
        setModuleUid(uid)
        setActions(actions)
        setAspectsPermissions(aspects)
        // Avoids this effect needing to be re-run on every aspect update
        // This is a one-time setup for the module's aspect permissions.
        currentAspectPermissions = aspects;
      };

      const handleAspectUpdate = (key: string, value: any) => {
        if (currentAspectPermissions && key in currentAspectPermissions) {
          console.log(`✅ Aspect updated: ${key} =`, value);
          setAspects(prev => ({ ...prev, [key]: value }));
        } else {
          console.warn(`🚨 Ignored aspect update for "${key}". Not in permitted aspects for this module.`);
        }
      };
    
      const handleOperation = (operation: ModuleOperation) => {
        setLastOperation(operation);
      };

      const {
        communicator: effectCommunicator,
        resultHandler,
        config
      } = initModule({
        window,
        initCallback,
        configSchema: moduleConfig,
        interpretResult,
        originConfig,
      });

      communicator = effectCommunicator;

      communicator.onOperation(handleOperation);
      communicator.onAspectUpdate(handleAspectUpdate);

      communicator.sendReady();

      setModuleCommunicator(communicator);
      setResultHandler(() => resultHandler);
      setConfig(config);
    }
    catch (error) {
      console.error('Error initializing module:', error);
    }

    return () => {
      communicator?.cleanup()
    }
  }, []);
  // endregion Frozen

  // Hidden Object Game UI
  return (
    <div className="hidden-object-game">
      {config ? (
        gameRoom ? (
          <div className="game-container">
            {/* Game Room - Main Area */}
            <div className="relative">
              <div className="game-room">
                {/* Background Image Placeholder */}
                <div
                  className="room-background"
                  style={{
                    backgroundImage: `url(${gameRoom.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '600px',
                    position: 'relative'
                  }}
                >
                  <div className="absolute top-0 left-0 p-4 bg-noir-dark bg-opacity-80 rounded-br border-r border-b border-neon-blue">
                    <h2 className="text-xl font-bold text-neon-blue">{gameRoom.name}</h2>
                    <p className="text-sm opacity-75">{gameRoom.description}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 p-3 bg-noir-dark bg-opacity-80 rounded-tr border-r border-t border-neon-blue">
                    <p className="text-xs text-neon-blue">🔍 Investigation Scene</p>
                    <p className="text-xs opacity-50">
                      Click on suspicious objects to discover evidence
                    </p>
                  </div>
                </div>

                {/* Hotspots */}
                {gameRoom.objects.map((object) => (
                  <div
                    key={object.id}
                    className={`hotspot ${
                      foundObjects.has(object.id)
                        ? 'found'
                        : gameState.currentHint === object.id
                        ? 'hint'
                        : ''
                    }`}
                    style={{
                      left: `${object.position.x}%`,
                      top: `${object.position.y}%`,
                      width: `${object.size.width}%`,
                      height: `${object.size.height}%`,
                      border: '2px solid rgba(0, 255, 255, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: foundObjects.has(object.id)
                        ? 'rgba(0, 255, 65, 0.3)'
                        : gameState.currentHint === object.id
                        ? 'rgba(255, 0, 64, 0.3)'
                        : 'rgba(0, 255, 255, 0.1)',
                      boxShadow: foundObjects.has(object.id)
                        ? '0 0 15px rgba(0, 255, 65, 0.5)'
                        : gameState.currentHint === object.id
                        ? '0 0 15px rgba(255, 0, 64, 0.5)'
                        : '0 0 10px rgba(0, 255, 255, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleObjectClick(object.id)}
                    title={foundObjects.has(object.id) ? `Found: ${object.name}` : object.name}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleObjectClick(object.id);
                      }
                    }}
                  >
                    {foundObjects.has(object.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-neon-green text-lg font-bold">✓</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs bg-noir-dark bg-opacity-80 p-1 rounded">
                        {object.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Game Controls */}
              <div className="game-controls p-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex items-center space-x-6">
                    <h1 className="text-2xl font-bold">{config.gameTitle}</h1>
                    <div className="text-sm">
                      <span className="text-gray-400">Evidence:</span>
                      <span className="text-neon-blue ml-2 font-bold">
                        {discoveredClues.length} / {gameRoom.objects.length}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Critical:</span>
                      <span className="text-neon-red ml-2 font-bold">
                        {discoveredClues.filter(c => c.importance === 'critical').length} / {getCriticalCluesCount(gameRoom)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {config.timerEnabled && gameState.timeRemaining && (
                      <div className={`game-timer text-lg ${
                        gameState.timeRemaining < 60 ? 'danger' :
                        gameState.timeRemaining < 120 ? 'warning' : ''
                      }`}>
                        ⏱️ {formatTime(gameState.timeRemaining)}
                      </div>
                    )}
                    
                    {config.hintsEnabled && (
                      <button
                        onClick={handleHintRequest}
                        disabled={gameState.hintsRemaining <= 0}
                        className={`neon-button ${gameState.hintsRemaining > 0 ? 'warning' : ''}`}
                      >
                        💡 Hints: {gameState.hintsRemaining}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Tracker - Sidebar */}
            <div className="evidence-tracker p-4 overflow-y-auto">
              <h3 className="text-xl font-bold mb-6 text-center">EVIDENCE BOARD</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Investigation Progress</span>
                  <span>{discoveredClues.length}/{gameRoom.objects.length}</span>
                </div>
                <div className="progress-bar h-3">
                  <div
                    className="progress-fill h-full"
                    style={{ width: `${(discoveredClues.length / gameRoom.objects.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Clue List */}
              <div className="space-y-3">
                {discoveredClues.map((clue, index) => (
                  <div
                    key={clue.id}
                    className={`clue-item p-4 ${
                      gameState.selectedClue?.id === clue.id ? 'selected' : ''
                    }`}
                    onClick={() => setGameState(prev => ({
                      ...prev,
                      selectedClue: prev.selectedClue?.id === clue.id ? null : clue
                    }))}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setGameState(prev => ({
                          ...prev,
                          selectedClue: prev.selectedClue?.id === clue.id ? null : clue
                        }));
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white">{clue.title}</h4>
                      <span className={`importance-badge text-xs px-2 py-1 rounded ${clue.importance}`}>
                        {clue.importance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{clue.shortDescription}</p>
                    <div className="flex justify-between items-center">
                      <span className={`evidence-type-badge ${clue.evidenceType}`}>
                        {clue.evidenceType}
                      </span>
                      {clue.timestamp && (
                        <span className="text-xs text-gray-500">🕐 {clue.timestamp}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Clue Detail */}
              {gameState.selectedClue && (
                <div className="mt-6 p-4 bg-noir-dark border border-neon-red rounded">
                  <h4 className="text-sm font-bold text-neon-red mb-3">🔍 INVESTIGATION NOTES</h4>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    {gameState.selectedClue.fullNarrative}
                  </p>
                  {gameState.selectedClue.location && (
                    <p className="text-xs text-gray-500">
                      📍 Location: {gameState.selectedClue.location}
                    </p>
                  )}
                  {gameState.selectedClue.relatedClues && gameState.selectedClue.relatedClues.length > 0 && (
                    <p className="text-xs text-neon-blue mt-2">
                      🔗 Connected to {gameState.selectedClue.relatedClues.length} other clue(s)
                    </p>
                  )}
                </div>
              )}

              {/* Game Status */}
              <div className="mt-6 p-3 bg-noir-medium rounded text-xs">
                <h4 className="text-gray-400 mb-2 font-bold">CASE STATUS</h4>
                <div className="space-y-1">
                  <p className="text-gray-500">Status: <span className="text-neon-blue">{gameState.status}</span></p>
                  <p className="text-gray-500">Clicks: <span className="text-white">{gameState.totalClicks}</span></p>
                  <p className="text-gray-500">Scene: <span className="text-white">{config.roomId}</span></p>
                  <p className="text-gray-500">Difficulty: <span className="text-white">{config.difficulty}</span></p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
              <p className="text-neon-blue text-lg">Loading investigation scene...</p>
              <p className="text-gray-400 text-sm mt-2">Preparing evidence for analysis</p>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="text-neon-blue text-lg">Initializing detective module...</p>
            <p className="text-gray-400 text-sm mt-2">Establishing secure connection</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;