import { createApp } from './app/loaders/express.js';
import { env } from './config/env.js';
const app = createApp();
app.listen(env.PORT ?? 3000, () => {
    console.log(`API escuchando en http://localhost:${env.PORT ?? 3000}`);
    console.log(`Swagger:          http://localhost:${env.PORT ?? 3000}/docs`);
});
export default app;
//# sourceMappingURL=index.js.map