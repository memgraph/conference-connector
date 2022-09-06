import LeaderboardCardMobile from "./leaderboardCardMobile";
import styles from "../styles/Home.module.css";

interface Props {
    data: any,
}

const LeaderboardMobile: React.FC<Props> = ({ data }) => {
    let place = 0;
    return (<div style={{ width: "95%" }}>
        {
            data.map((value: { rank: string; fullName: string; username: string; }, index: any) => {
                place++;
                return (
                    <div key={place} className={styles.leaderboardGrid}>
                        <LeaderboardCardMobile key={place} rank={String(place)} fullName={value.fullName} username={value.username}></LeaderboardCardMobile>
                    </div>
                );
            })
        }
    </div>
    );
}

export default LeaderboardMobile;
