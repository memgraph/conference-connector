import LeaderboardCardMobile from "./leaderboardCardMobile";
import styles from "../styles/Home.module.css";

interface Props {
    data: any,
}

const LeaderboardMobile: React.FC<Props> = ({ data }) => {

    return (<div style={{ width: "95%" }}>
        {
            data.map((value: { rank: string; fullName: string; username: string; }, index: any) => {
                return (
                    <div key={value.rank} className={styles.leaderboardGrid}>
                        <LeaderboardCardMobile key={value.rank} rank={value.rank} fullName={value.fullName} username={value.username}></LeaderboardCardMobile>
                    </div>
                );
            })
        }
    </div>
    );
}

export default LeaderboardMobile;
