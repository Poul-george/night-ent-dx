export const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    // ログインページにリダイレクト
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    // エラー時も一応ログインページへ
    window.location.href = '/';
  }
}; 