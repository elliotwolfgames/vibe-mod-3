// Game data structures and sample content for the hidden object detective game

export interface ClueData {
  id: string;
  title: string;
  shortDescription: string;
  fullNarrative: string;
  evidenceType: EvidenceType;
  importance: ClueImportance;
  discoveryOrder?: number;
  relatedClues?: string[];
  multimedia?: ClueMedia;
  timestamp?: string;
  location?: string;
}

export type EvidenceType = 
  | 'document'
  | 'digital'
  | 'physical'
  | 'witness'
  | 'forensic'
  | 'surveillance'
  | 'financial'
  | 'communication';

export type ClueImportance = 
  | 'critical'
  | 'supporting'
  | 'background'
  | 'red-herring';

export interface ClueMedia {
  image?: string;
  audio?: string;
  document?: string;
  video?: string;
}

export interface HiddenObject {
  id: string;
  name: string;
  position: { x: number; y: number }; // percentage-based positioning
  size: { width: number; height: number };
  clue: ClueData;
  isFound: boolean;
  isRedHerring: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameRoom {
  id: string;
  name: string;
  backgroundImage: string;
  description: string;
  objects: HiddenObject[];
  ambientSound?: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  relatedClues: string[];
  suspicionLevel: number;
}

export interface CaseResolution {
  outcome: 'murder' | 'suicide' | 'accident' | 'inconclusive';
  suspect?: string;
  motive?: string;
  confidence: number;
  evidence: string[];
  reasoning: string;
}

// Sample detective apartment room data
export const detectiveApartmentRoom: GameRoom = {
  id: "detective_apartment",
  name: "Detective's Apartment",
  backgroundImage: "images/detective-apartment.jpg",
  description: "A cluttered apartment belonging to Detective Sarah Chen. Something doesn't feel right...",
  objects: [
    {
      id: "laptop",
      name: "Laptop Computer",
      position: { x: 65, y: 45 },
      size: { width: 8, height: 6 },
      clue: {
        id: "laptop_files",
        title: "Encrypted Laptop Files",
        shortDescription: "Password-protected files on victim's computer",
        fullNarrative: `Sarah's laptop contains several encrypted folders with cryptic names like "Project_Nightfall" and "Insurance_Policy". The timestamps show she was working on these files until just hours before her death. One partially corrupted file contains fragments of what appears to be financial transactions and communication logs with unknown parties. The encryption is military-grade - someone really didn't want this information to be found.`,
        evidenceType: "digital",
        importance: "critical",
        relatedClues: ["financial_records", "final_email"],
        multimedia: {
          image: "evidence/laptop_screen.jpg"
        },
        timestamp: "2024-01-15 17:30",
        location: "Victim's office desk"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "medium"
    },
    {
      id: "security_camera",
      name: "Security Camera Footage",
      position: { x: 15, y: 25 },
      size: { width: 6, height: 4 },
      clue: {
        id: "security_footage",
        title: "Security Camera Footage",
        shortDescription: "Building surveillance from the day of incident",
        fullNarrative: `The security footage reveals several interesting details. At 2:15 PM, an unidentified person in a maintenance uniform enters the building through a service entrance - but there were no scheduled maintenance visits that day. The person avoids the main cameras but is briefly visible in the parking garage. More disturbing is what the footage doesn't show: there's a 20-minute gap in the recording from 6:00-6:20 PM, right around the estimated time of death. Someone with system access deleted those crucial minutes.`,
        evidenceType: "surveillance",
        importance: "critical",
        relatedClues: ["keycard_log", "maintenance_schedule"],
        multimedia: {
          video: "evidence/security_footage.mp4",
          image: "evidence/mystery_person.jpg"
        },
        timestamp: "2024-01-15 14:15",
        location: "Building security office"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "hard"
    },
    {
      id: "journal",
      name: "Personal Journal",
      position: { x: 45, y: 70 },
      size: { width: 5, height: 7 },
      clue: {
        id: "personal_diary",
        title: "Personal Journal Entry",
        shortDescription: "Handwritten notes in victim's personal journal",
        fullNarrative: `Sarah's final journal entry, written the morning of her death, reveals her growing paranoia: "I know someone is watching me. The files I found prove everything - the missing money, the fake contracts, the offshore accounts. M thinks I don't know, but I've been documenting everything. If something happens to me, the truth is hidden where only I would think to look. The red bird knows the way." The handwriting becomes increasingly erratic toward the end, suggesting extreme stress or fear.`,
        evidenceType: "document",
        importance: "supporting",
        relatedClues: ["financial_records", "hidden_safe"],
        multimedia: {
          image: "evidence/journal_page.jpg"
        },
        timestamp: "2024-01-15 08:00",
        location: "Victim's apartment"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "easy"
    },
    {
      id: "phone",
      name: "Mobile Phone",
      position: { x: 75, y: 60 },
      size: { width: 4, height: 6 },
      clue: {
        id: "phone_records",
        title: "Phone Call Records",
        shortDescription: "Recent calls and messages on victim's phone",
        fullNarrative: `The phone's call log shows several concerning patterns. Multiple calls to an unknown number in the days leading up to the incident, with the last call lasting only 12 seconds at 5:47 PM on the day of death. Text messages reveal increasing desperation: "They know I have the files" and "Meeting tonight - if something happens, check the red bird." Most intriguingly, there's a deleted voicemail from an unknown caller that was recovered from the phone's backup. The message is brief but chilling: "Stop digging or join your predecessor."`,
        evidenceType: "communication",
        importance: "critical",
        relatedClues: ["final_email", "security_footage"],
        multimedia: {
          image: "evidence/phone_screen.jpg",
          audio: "evidence/voicemail.mp3"
        },
        timestamp: "2024-01-15 17:47",
        location: "Found in victim's pocket"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "medium"
    },
    {
      id: "coffee_cup",
      name: "Coffee Cup",
      position: { x: 55, y: 50 },
      size: { width: 3, height: 4 },
      clue: {
        id: "coffee_analysis",
        title: "Coffee Cup Analysis",
        shortDescription: "Forensic analysis of victim's coffee cup",
        fullNarrative: `The coffee cup on Sarah's desk contains traces of her usual morning blend, but forensic analysis reveals something more sinister. Microscopic residue of a rare sedative was found around the rim - not enough to be fatal, but sufficient to cause disorientation and confusion. The sedative is typically used in veterinary medicine and is not easily obtained. This suggests the perpetrator had either medical connections or access to veterinary supplies. The timing indicates it was added to her afternoon coffee, explaining why her final journal entries became increasingly erratic.`,
        evidenceType: "forensic",
        importance: "supporting",
        relatedClues: ["personal_diary", "medical_records"],
        multimedia: {
          image: "evidence/coffee_cup.jpg"
        },
        timestamp: "2024-01-15 15:30",
        location: "Victim's desk"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "hard"
    },
    {
      id: "business_card",
      name: "Business Card",
      position: { x: 35, y: 35 },
      size: { width: 4, height: 3 },
      clue: {
        id: "competitor_contact",
        title: "Competitor's Business Card",
        shortDescription: "Business card from rival company executive",
        fullNarrative: `A business card for Marcus Webb, CEO of TechRival Corp, was found tucked inside one of Sarah's technical manuals. On the back, handwritten in Sarah's writing: "Offered $2M for Project Nightfall specs - DECLINED." The card shows signs of being handled frequently, and there are coffee stains suggesting multiple meetings. TechRival Corp has been struggling financially and would benefit enormously from acquiring Sarah's company's proprietary technology. This establishes both motive and opportunity for corporate espionage.`,
        evidenceType: "document",
        importance: "supporting",
        relatedClues: ["laptop_files", "financial_records"],
        multimedia: {
          image: "evidence/business_card.jpg"
        },
        timestamp: "2024-01-10",
        location: "Inside technical manual"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "easy"
    },
    {
      id: "red_bird_statue",
      name: "Red Bird Statue",
      position: { x: 25, y: 65 },
      size: { width: 5, height: 6 },
      clue: {
        id: "hidden_evidence",
        title: "Hidden Evidence Cache",
        shortDescription: "Secret compartment in decorative bird statue",
        fullNarrative: `The red ceramic bird statue that Sarah mentioned in her journal contains a hidden compartment. Inside are USB drives, printed emails, and financial documents that paint a clear picture of corporate espionage and embezzlement. The documents show that Marcus Webb had been systematically stealing proprietary information and selling it to competitors. Sarah had discovered the scheme and was preparing to expose him. The final document is a draft email to the FBI, never sent, detailing the entire conspiracy. This cache represents the "insurance policy" Sarah had been building against her killer.`,
        evidenceType: "digital",
        importance: "critical",
        relatedClues: ["personal_diary", "laptop_files", "competitor_contact"],
        multimedia: {
          image: "evidence/hidden_cache.jpg",
          document: "evidence/fbi_draft.pdf"
        },
        timestamp: "2024-01-14",
        location: "Hidden in bird statue"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "medium"
    }
  ]
};

// Sample corporate office room data
export const corporateOfficeRoom: GameRoom = {
  id: "corporate_office",
  name: "Corporate Office",
  backgroundImage: "images/corporate-office.jpg",
  description: "The sleek corporate office where the conspiracy began...",
  objects: [
    // Add more objects for variety
    {
      id: "shredder",
      name: "Paper Shredder",
      position: { x: 80, y: 40 },
      size: { width: 6, height: 8 },
      clue: {
        id: "shredded_documents",
        title: "Partially Shredded Documents",
        shortDescription: "Reconstructed fragments from the office shredder",
        fullNarrative: `Forensic reconstruction of shredded documents reveals fragments of financial transfers and communication with offshore accounts. The documents were hastily destroyed, leaving enough pieces to reconstruct key information about money laundering operations.`,
        evidenceType: "document",
        importance: "supporting",
        relatedClues: ["financial_records"],
        timestamp: "2024-01-15 18:00",
        location: "Office shredder"
      },
      isFound: false,
      isRedHerring: false,
      difficulty: "hard"
    }
  ]
};

// Character data
export const gameCharacters: Character[] = [
  {
    id: "sarah_chen",
    name: "Sarah Chen",
    role: "Victim - Tech Executive",
    description: "Brilliant but secretive CTO who discovered something dangerous",
    relatedClues: ["laptop_files", "personal_diary", "phone_records"],
    suspicionLevel: 0
  },
  {
    id: "marcus_webb",
    name: "Marcus Webb",
    role: "Business Partner",
    description: "Ambitious CEO with financial troubles",
    relatedClues: ["competitor_contact", "financial_records", "phone_records"],
    suspicionLevel: 85
  }
];

// Available rooms
export const availableRooms: Record<string, GameRoom> = {
  detective_apartment: detectiveApartmentRoom,
  corporate_office: corporateOfficeRoom,
  crime_scene: detectiveApartmentRoom // Placeholder - could be different
};

// Helper function to get room by ID
export const getRoomById = (roomId: string): GameRoom | null => {
  return availableRooms[roomId] || null;
};

// Helper function to calculate total critical clues in a room
export const getCriticalCluesCount = (room: GameRoom): number => {
  return room.objects.filter(obj => obj.clue.importance === 'critical').length;
};

// Helper function to get clues by importance
export const getCluesByImportance = (room: GameRoom, importance: ClueImportance): ClueData[] => {
  return room.objects
    .filter(obj => obj.clue.importance === importance)
    .map(obj => obj.clue);
};