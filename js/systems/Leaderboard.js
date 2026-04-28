class Leaderboard {
  constructor() {
    this.storageKey = 'dae_leaderboard';
    this.currentUser = null;
  }

  init() {
    this.loadUser();
  }

  loadUser() {
    try {
      const userData = wx.getStorageSync('dae_user');
      if (userData) {
        this.currentUser = userData;
      }
    } catch (e) {
      console.error('加载用户数据失败:', e);
    }
  }

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          const guestUser = {
            id: this.generateUserId(),
            nickname: '玩家' + Math.floor(Math.random() * 10000),
            avatarUrl: '',
            bestScore: 0,
            bestLevel: 0,
            playCount: 0
          };
          
          this.currentUser = guestUser;
          this.saveUser();
          resolve(this.currentUser);
        },
        fail: (err) => {
          const guestUser = {
            id: this.generateUserId(),
            nickname: '玩家' + Math.floor(Math.random() * 10000),
            avatarUrl: '',
            bestScore: 0,
            bestLevel: 0,
            playCount: 0
          };
          
          this.currentUser = guestUser;
          this.saveUser();
          resolve(this.currentUser);
        }
      });
    });
  }

  saveUser() {
    try {
      wx.setStorageSync('dae_user', this.currentUser);
    } catch (e) {
      console.error('保存用户数据失败:', e);
    }
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateScore(score, level) {
    if (!this.currentUser) return;
    
    this.currentUser.playCount = (this.currentUser.playCount || 0) + 1;
    
    if (score > (this.currentUser.bestScore || 0)) {
      this.currentUser.bestScore = score;
    }
    
    if (level > (this.currentUser.bestLevel || 0)) {
      this.currentUser.bestLevel = level;
    }
    
    this.saveUser();
    this.updateLeaderboard(this.currentUser);
  }

  updateLeaderboard(user) {
    let leaderboard = this.getLeaderboard();
    
    const existingIndex = leaderboard.findIndex(u => u.id === user.id);
    if (existingIndex !== -1) {
      const existingUser = leaderboard[existingIndex];
      if (user.bestScore > existingUser.bestScore) {
        leaderboard[existingIndex] = { ...user };
      }
    } else {
      leaderboard.push({ ...user });
    }
    
    leaderboard.sort((a, b) => b.bestScore - a.bestScore);
    leaderboard = leaderboard.slice(0, 100);
    
    try {
      wx.setStorageSync(this.storageKey, leaderboard);
    } catch (e) {
      console.error('保存排行榜失败:', e);
    }
  }

  getLeaderboard() {
    try {
      const data = wx.getStorageSync(this.storageKey);
      return data || [];
    } catch (e) {
      console.error('加载排行榜失败:', e);
      return [];
    }
  }

  getMyRank() {
    if (!this.currentUser) return null;
    
    const leaderboard = this.getLeaderboard();
    const myIndex = leaderboard.findIndex(u => u.id === this.currentUser.id);
    
    if (myIndex === -1) {
      return {
        rank: leaderboard.length + 1,
        score: this.currentUser.bestScore || 0,
        isLoggedIn: true
      };
    }
    
    return {
      rank: myIndex + 1,
      score: leaderboard[myIndex].bestScore,
      isLoggedIn: true
    };
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    try {
      wx.removeStorageSync('dae_user');
    } catch (e) {
      console.error('退出登录失败:', e);
    }
  }
}

export default Leaderboard;
