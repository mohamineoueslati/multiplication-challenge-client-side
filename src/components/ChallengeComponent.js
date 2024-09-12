import ChallengeService from "../services/ChallengeService";
import {Component} from "react";
import LastAttemptsComponent from "./LastAttemptsComponent";

class ChallengeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            a: '',
            b: '',
            user: '',
            message: '',
            guess: 0,
            lastAttempts: []
        };
        this.handleSubmitResult = this.handleSubmitResult.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(): void {
        this.refreshChallenge();
    }

    refreshChallenge() {
        ChallengeService.challenge().then(res => {
            if (res.ok) {
                res.json().then(json => {
                    this.setState({a: json.factorA, b: json.factorB});
                });
            } else {
                this.updateMessage("Can't reach the server");
            }
        });
    }

    handleChange(event) {
        const name = event.target.name;
        this.setState({[name]: event.target.value});
    }

    handleSubmitResult(event) {
        event.preventDefault();
        ChallengeService.sendGuess(this.state.user, this.state.a, this.state.b, this.state.guess).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    if (json.correct) {
                        this.updateMessage("Congratulations! Your guess is correct");
                    } else {
                        this.updateMessage(`Oops! Your guess ${json.resultAttempt} is wrong, but keep playing!`);
                    }
                    this.updateLastAttempts(this.state.user);
                    this.refreshChallenge();
                });
            } else {
                this.updateMessage("Error: server error or not available");
            }
        });
    }

    updateMessage(m: string) {
        this.setState({
            message: m
        });
    }

    updateLastAttempts(userAlias: string) {
        ChallengeService.getAttempts(userAlias).then(res => {
            if (res.ok) {
                let attempts = [];
                res.json().then(data => {
                    data.forEach(item => {
                        attempts.push(item);
                    });
                    this.setState({
                        lastAttempts: attempts
                    });
                })
            }
        })
    }

    render() {
        return (
            <div className="display-column">
                <div>
                    <h3>Your new challenge is</h3>
                    <div className="challenge">
                        {this.state.a} x {this.state.b}
                    </div>
                </div>
                <form onSubmit={this.handleSubmitResult}>
                    <div className="form-container">
                        <label htmlFor="alias">Your alias:</label>
                        <input id="alias"
                               type="text"
                               maxLength="12"
                               name="user"
                               value={this.state.user}
                               onChange={this.handleChange}/>
                    </div>
                    <div className="form-container">
                        <label htmlFor="guess">Your guess:</label>
                        <input id="guess"
                               type="number"
                               min="0"
                               name="guess"
                               value={this.state.guess}
                               onChange={this.handleChange}/>
                    </div>
                    <div className="form-container">
                        <input id="guess" className="input-group submit-button" type="submit" value="Submit"/>
                    </div>
                </form>
                <h4>{this.state.message}</h4>
                {this.state.lastAttempts.length > 0 && <LastAttemptsComponent lastAttempts={this.state.lastAttempts}/>}
            </div>
        );
    }
}

export default ChallengeComponent;