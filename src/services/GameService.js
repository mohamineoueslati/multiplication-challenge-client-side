class GameService {
    static SERVER_URL = 'http://localhost:8000';
    static GET_LEADERBOARD = '/leaders';
    static leaderBoard(): Promise<Response> {
        return fetch(`${GameService.SERVER_URL}${GameService.GET_LEADERBOARD}`);
    }
}

export default GameService;