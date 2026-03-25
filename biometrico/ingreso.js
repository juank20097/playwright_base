const { runFlow } = require('./base-flow');

runFlow(async ({ page, takeShot, addStep }) => {
    await page.goto('https://biometrico.funcionjudicial.gob.ec/');
        await takeShot(page, '01-login-page', 'Pantalla inicial de login');

        await page.getByRole('textbox', { name: 'Usuario' }).click();
        await page.getByRole('textbox', { name: 'Usuario' }).fill('juan.estevez');
        await page.getByRole('textbox', { name: 'Usuario' }).press('Tab');
        await page.getByRole('textbox', { name: 'Contraseña' }).fill('JK1003422365.');
        await takeShot(page, '02-credenciales', 'Credenciales ingresadas');

        await page.getByRole('textbox', { name: 'Contraseña' }).press('Enter');
        await page.waitForLoadState('networkidle');
        await takeShot(page, '03-login-exitoso', 'Ingreso exitoso al sistema');

        await page.locator('#province').selectOption('17');
        await page.locator('#city').selectOption('1701');
        await page.locator('#markingtype').selectOption('1');
        await takeShot(page, '04-filtros-iniciales', 'Filtros iniciales seleccionados');

        // await page.getByRole('button', { name: 'Registrar Marcación Presencial' }).click();
        // const confirmarBtn = page.getByRole('button', { name: 'Si, Registrar!' });
        // await confirmarBtn.waitFor({ state: 'visible', timeout: 10000 });
        // await confirmarBtn.scrollIntoViewIfNeeded();
        // await confirmarBtn.click();
        // await page.waitForLoadState('networkidle');
        // await takeShot(page, '05-registrar-marcacion', 'Registrar marcación presencial');

        await page.getByRole('link', { name: 'Reporte Asistencia General' }).click();
        await page.waitForLoadState('networkidle');
        await takeShot(page, '06-reporte-asistencia', 'Pantalla de reporte asistencia general');

        await page.getByRole('textbox', { name: 'Fecha Desde' }).click();
        const today = new Date().getDate().toString();
        await page.getByRole('link', { name: today, exact: true }).click();
        await takeShot(page, '07-fecha-desde', 'Fecha desde seleccionada');

        await page.getByRole('textbox', { name: 'Fecha Hasta' }).click();
        await page.getByRole('link', { name: today, exact: true }).click();
        await takeShot(page, '08-fecha-hasta', 'Fecha hasta seleccionada');

        await page.locator('#province').selectOption('17');
        await page.locator('#city').selectOption('1701');
        await takeShot(page, '09-filtros-finales', 'Filtros finales configurados');

        await page.getByRole('button', { name: 'Ver Reporte' }).click();
        await page.waitForLoadState('networkidle');
        await takeShot(page, '10-reporte-generado', 'Reporte generado correctamente');

        await page.getByRole('link', { name: 'Salir' }).click();
        await takeShot(page, '11-salida', 'Salida del sistema realizada');
});