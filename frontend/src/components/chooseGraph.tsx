import ChooseGraphCard from "./chooseGraphCard";
import styles from "../styles/Home.module.css";

interface Props {
    data: any,
    handleGraphUpdate: any,
}

const ChooseGraph: React.FC<Props> = ({ data, handleGraphUpdate }) => {
    return (<div style={{ width: "95%" }}>
        {
            data.map((value: { key: string; name: string; }, index: any) => {
                return (
                    <div key={index} className={styles.leaderboardGrid}>
                        <ChooseGraphCard key={index} position={index} routeKey={value.key} name={value.name} handleGraphUpdate={handleGraphUpdate}></ChooseGraphCard>
                    </div>
                );
            })
        }
    </div>
    );
}

export default ChooseGraph
