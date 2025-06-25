export type Cooldown = {
    /**
     * @property how long the cooldown is:
     */
    time: 5000 | 3000 | 1000

    /**
    * @property expireacy of the cooldown:
    */
    expiresAt: number

    /**
     * @property the type of the cooldown
     */
    type: "message" | "interaction" | "command"

    
    /**
     * @property user id
     */
    id: string
}