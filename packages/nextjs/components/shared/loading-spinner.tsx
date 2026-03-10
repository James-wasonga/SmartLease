import { CSSProperties } from "react";
import { MoonLoader } from "react-spinners";

const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

const LoadingSpinner = ({loading, size = 70}: {loading: boolean, size?: number}) => {
    return (
        <>
            <MoonLoader
                color={"#3b82f6"}
                loading={loading}
                cssOverride={override}
                size={size}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </>
    )
}

export default LoadingSpinner