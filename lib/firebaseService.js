import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

// Teams CRUD Operations
export const teamsService = {
  // Get all teams
  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  // Get team by ID
  async getById(id) {
    try {
      const docRef = doc(db, 'teams', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Team not found');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  // Create new team
  async create(teamData) {
    try {
      const docRef = await addDoc(collection(db, 'teams'), {
        ...teamData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  // Update team
  async update(id, teamData) {
    try {
      const docRef = doc(db, 'teams', id);
      await updateDoc(docRef, {
        ...teamData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  // Delete team
  async delete(id) {
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }
};

// Players CRUD Operations
export const playersService = {
  // Get all players
  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  // Get players by team
  async getByTeam(teamName) {
    try {
      const q = query(
        collection(db, 'players'), 
        where('team', '==', teamName)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching players by team:', error);
      throw error;
    }
  },

  // Get unassigned players
  async getUnassigned() {
    try {
      const q = query(
        collection(db, 'players'), 
        where('team', '==', null)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching unassigned players:', error);
      throw error;
    }
  },

  // Create new player
  async create(playerData) {
    try {
      const docRef = await addDoc(collection(db, 'players'), {
        ...playerData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  },

  // Update player
  async update(id, playerData) {
    try {
      const docRef = doc(db, 'players', id);
      await updateDoc(docRef, {
        ...playerData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  // Assign player to team
  async assignToTeam(playerId, teamName) {
    try {
      const docRef = doc(db, 'players', playerId);
      await updateDoc(docRef, {
        team: teamName,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error assigning player to team:', error);
      throw error;
    }
  },

  // Delete player
  async delete(id) {
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }
};

// Auction CRUD Operations
export const auctionService = {
  // Get current auction
  async getCurrent() {
    try {
      const q = query(
        collection(db, 'auctions'), 
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching current auction:', error);
      throw error;
    }
  },

  // Create new auction
  async create(auctionData) {
    try {
      const docRef = await addDoc(collection(db, 'auctions'), {
        ...auctionData,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  },

  // Place bid
  async placeBid(auctionId, bidData) {
    try {
      const auctionRef = doc(db, 'auctions', auctionId);
      await updateDoc(auctionRef, {
        currentBid: bidData.amount,
        highestBidder: bidData.team,
        updatedAt: new Date()
      });

      // Add to bid history
      await addDoc(collection(db, 'bids'), {
        auctionId,
        ...bidData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  },

  // Get bid history for auction
  async getBidHistory(auctionId) {
    try {
      const q = query(
        collection(db, 'bids'),
        where('auctionId', '==', auctionId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching bid history:', error);
      throw error;
    }
  },

  // Listen to auction updates (real-time)
  onAuctionUpdate(auctionId, callback) {
    const auctionRef = doc(db, 'auctions', auctionId);
    return onSnapshot(auctionRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  },

  // Listen to bid updates (real-time)
  onBidUpdate(auctionId, callback) {
    const q = query(
      collection(db, 'bids'),
      where('auctionId', '==', auctionId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const bids = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(bids);
    });
  }
};
