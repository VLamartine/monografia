const changeLanguage = (language) => {
    this.location.pathname = this.location.pathname.replace(/\/[a-z]{2}\//, `/${language.value}/`);
}