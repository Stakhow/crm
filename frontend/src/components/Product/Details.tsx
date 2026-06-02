import type { SxProps, Theme } from "@mui/material";
import { ListItemDots } from "../ListItemDots";

export const Details = ({
    data,
    ...rest
}: {
    data: { title: string; value: string | number }[];
    sx?: SxProps<Theme>;
}) => !!data && data.map(({ title, value }, idx) => <ListItemDots key={idx} title={title} value={value} {...rest} />);
