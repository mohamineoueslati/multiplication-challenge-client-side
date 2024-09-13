import {Component} from "react";
import GameService from "../services/GameService";
import ChallengeService from "../services/ChallengeService";

class LeaderBoardComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leaderboard: [],
            serverError: false,
        }
    }

    componentDidMount() {
        this.refreshLeaderBoard();
        // sets a timer to refresh the leaderboard every 5 seconds
        setInterval(this.refreshLeaderBoard.bind(this), 5000);
    }

    getLeaderBoardData(): Promise {
        return GameService.leaderBoard().then(leaderboardData => {
            if (leaderboardData.ok) {
                return leaderboardData.json();
            } else {
                return Promise.reject("Gamification: error response");
            }
        });
    }

    getUserAliasData(userIds: number[]): Promise {
        return ChallengeService.getUsers(userIds).then(userRes => {
            if (userRes.ok) {
                return userRes.json();
            } else {
                return Promise.reject("Multiplication: error response");
            }
        });
    }

    updateLeaderBoard(leaderboard) {
        this.setState({leaderboard: leaderboard, serverError: false});
    }

    refreshLeaderBoard() {
        this.getLeaderBoardData().then(leaderboardData => {
            let userIds = leaderboardData.map(row => row.userId);
            this.getUserAliasData(userIds).then(data => {
                // build a map of id -> alias
                let userMap = new Map();
                data.forEach(item => {
                    userMap.set(item.id, item.alias);
                });
                // add a property to existing lb data
                leaderboardData.forEach(row => {
                   row['alias'] = userMap.get(row.userId);
                });
                this.updateLeaderBoard(leaderboardData);
            }).catch(error => {
                console.log('Error mapping user ids', error);
                this.updateLeaderBoard(leaderboardData);
            });
        }).catch(error => {
            this.setState({ serverError: true });
            console.log('Gamification server error', error);
        });
    }

    render() {
        if (this.state.serverError) {
            return (
                <div>We're sorry, but we can't display game statistics at this moment.</div>
            );
        }
        return (
            <div>
                <h3>Leaderboard</h3>
                <table>
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Score</th>
                        <th>Badges</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.leaderboard.map(row =>
                        <tr key={row.userId}>
                            <td>{row.alias ? row.alias : row.userId}</td>
                            <td>{row.totalScore}</td>
                            <td>
                                {row.badges.map(b =>
                                    <span className="badge" key={b}>{b}</span>
                                )}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default LeaderBoardComponent;