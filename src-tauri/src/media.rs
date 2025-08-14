use std::path::{PathBuf};
use glob::{glob, Pattern};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, skip_serializing_none};
use specta::Type;
use crate::err::{ApiResult};

struct Lang {
    code: &'static str,
    name: &'static str,
}

const LANG_LIST: &[Lang] = &[
    Lang{code:"ab", name:"Abkhazian"},
    Lang{code:"aa", name:"Afar"},
    Lang{code:"af", name:"Afrikaans"},
    Lang{code:"ak", name:"Akan"},
    Lang{code:"sq", name:"Albanian"},
    Lang{code:"am", name:"Amharic"},
    Lang{code:"ar", name:"Arabic"},
    Lang{code:"hy", name:"Armenian"},
    Lang{code:"as", name:"Assamese"},
    Lang{code:"ay", name:"Aymara"},
    Lang{code:"az", name:"Azerbaijani"},
    Lang{code:"bn", name:"Bangla"},
    Lang{code:"ba", name:"Bashkir"},
    Lang{code:"eu", name:"Basque"},
    Lang{code:"be", name:"Belarusian"},
    Lang{code:"bho", name:"Bhojpuri"},
    Lang{code:"bs", name:"Bosnian"},
    Lang{code:"br", name:"Breton"},
    Lang{code:"bg", name:"Bulgarian"},
    Lang{code:"my", name:"Burmese"},
    Lang{code:"ca", name:"Catalan"},
    Lang{code:"ceb", name:"Cebuano"},
    Lang{code:"zh-Hans", name:"Chinese (Simplified)"},
    Lang{code:"zh-Hant", name:"Chinese (Traditional)"},
    Lang{code:"co", name:"Corsican"},
    Lang{code:"hr", name:"Croatian"},
    Lang{code:"cs", name:"Czech"},
    Lang{code:"da", name:"Danish"},
    Lang{code:"dv", name:"Divehi"},
    Lang{code:"nl", name:"Dutch"},
    Lang{code:"dz", name:"Dzongkha"},
    Lang{code:"en", name:"English"},
    Lang{code:"eo", name:"Esperanto"},
    Lang{code:"et", name:"Estonian"},
    Lang{code:"ee", name:"Ewe"},
    Lang{code:"fo", name:"Faroese"},
    Lang{code:"fj", name:"Fijian"},
    Lang{code:"fil", name:"Filipino"},
    Lang{code:"fi", name:"Finnish"},
    Lang{code:"fr", name:"French"},
    Lang{code:"gaa", name:"Ga"},
    Lang{code:"gl", name:"Galician"},
    Lang{code:"lg", name:"Ganda"},
    Lang{code:"ka", name:"Georgian"},
    Lang{code:"de", name:"German"},
    Lang{code:"el", name:"Greek"},
    Lang{code:"gn", name:"Guarani"},
    Lang{code:"gu", name:"Gujarati"},
    Lang{code:"ht", name:"Haitian Creole"},
    Lang{code:"ha", name:"Hausa"},
    Lang{code:"haw", name:"Hawaiian"},
    Lang{code:"iw", name:"Hebrew"},
    Lang{code:"hi", name:"Hindi"},
    Lang{code:"hmn", name:"Hmong"},
    Lang{code:"hu", name:"Hungarian"},
    Lang{code:"is", name:"Icelandic"},
    Lang{code:"ig", name:"Igbo"},
    Lang{code:"id", name:"Indonesian"},
    Lang{code:"iu", name:"Inuktitut"},
    Lang{code:"ga", name:"Irish"},
    Lang{code:"it", name:"Italian"},
    Lang{code:"ja", name:"Japanese"},
    Lang{code:"jv", name:"Javanese"},
    Lang{code:"kl", name:"Kalaallisut"},
    Lang{code:"kn", name:"Kannada"},
    Lang{code:"kk", name:"Kazakh"},
    Lang{code:"kha", name:"Khasi"},
    Lang{code:"km", name:"Khmer"},
    Lang{code:"rw", name:"Kinyarwanda"},
    Lang{code:"ko-orig", name:"Korean (Original)"},
    Lang{code:"ko", name:"Korean"},
    Lang{code:"kri", name:"Krio"},
    Lang{code:"ku", name:"Kurdish"},
    Lang{code:"ky", name:"Kyrgyz"},
    Lang{code:"lo", name:"Lao"},
    Lang{code:"la", name:"Latin"},
    Lang{code:"lv", name:"Latvian"},
    Lang{code:"ln", name:"Lingala"},
    Lang{code:"lt", name:"Lithuanian"},
    Lang{code:"lua", name:"Luba-Lulua"},
    Lang{code:"luo", name:"Luo"},
    Lang{code:"lb", name:"Luxembourgish"},
    Lang{code:"mk", name:"Macedonian"},
    Lang{code:"mg", name:"Malagasy"},
    Lang{code:"ms", name:"Malay"},
    Lang{code:"ml", name:"Malayalam"},
    Lang{code:"mt", name:"Maltese"},
    Lang{code:"gv", name:"Manx"},
    Lang{code:"mi", name:"Mori"},
    Lang{code:"mr", name:"Marathi"},
    Lang{code:"mn", name:"Mongolian"},
    Lang{code:"mfe", name:"Morisyen"},
    Lang{code:"ne", name:"Nepali"},
    Lang{code:"new", name:"Newari"},
    Lang{code:"nso", name:"Northern Sotho"},
    Lang{code:"no", name:"Norwegian"},
    Lang{code:"ny", name:"Nyanja"},
    Lang{code:"oc", name:"Occitan"},
    Lang{code:"or", name:"Odia"},
    Lang{code:"om", name:"Oromo"},
    Lang{code:"os", name:"Ossetic"},
    Lang{code:"pam", name:"Pampanga"},
    Lang{code:"ps", name:"Pashto"},
    Lang{code:"fa", name:"Persian"},
    Lang{code:"pl", name:"Polish"},
    Lang{code:"pt", name:"Portuguese"},
    Lang{code:"pt-PT", name:"Portuguese (Portugal)"},
    Lang{code:"pa", name:"Punjabi"},
    Lang{code:"qu", name:"Quechua"},
    Lang{code:"ro", name:"Romanian"},
    Lang{code:"rn", name:"Rundi"},
    Lang{code:"ru", name:"Russian"},
    Lang{code:"sm", name:"Samoan"},
    Lang{code:"sg", name:"Sango"},
    Lang{code:"sa", name:"Sanskrit"},
    Lang{code:"gd", name:"Scottish Gaelic"},
    Lang{code:"sr", name:"Serbian"},
    Lang{code:"crs", name:"Seselwa Creole French"},
    Lang{code:"sn", name:"Shona"},
    Lang{code:"sd", name:"Sindhi"},
    Lang{code:"si", name:"Sinhala"},
    Lang{code:"sk", name:"Slovak"},
    Lang{code:"sl", name:"Slovenian"},
    Lang{code:"so", name:"Somali"},
    Lang{code:"st", name:"Southern Sotho"},
    Lang{code:"es", name:"Spanish"},
    Lang{code:"su", name:"Sundanese"},
    Lang{code:"sw", name:"Swahili"},
    Lang{code:"ss", name:"Swati"},
    Lang{code:"sv", name:"Swedish"},
    Lang{code:"tg", name:"Tajik"},
    Lang{code:"ta", name:"Tamil"},
    Lang{code:"tt", name:"Tatar"},
    Lang{code:"te", name:"Telugu"},
    Lang{code:"th", name:"Thai"},
    Lang{code:"bo", name:"Tibetan"},
    Lang{code:"ti", name:"Tigrinya"},
    Lang{code:"to", name:"Tongan"},
    Lang{code:"ts", name:"Tsonga"},
    Lang{code:"tn", name:"Tswana"},
    Lang{code:"tum", name:"Tumbuka"},
    Lang{code:"tr", name:"Turkish"},
    Lang{code:"tk", name:"Turkmen"},
    Lang{code:"uk", name:"Ukrainian"},
    Lang{code:"ur", name:"Urdu"},
    Lang{code:"ug", name:"Uyghur"},
    Lang{code:"uz", name:"Uzbek"},
    Lang{code:"ve", name:"Venda"},
    Lang{code:"vi", name:"Vietnamese"},
    Lang{code:"war", name:"Waray"},
    Lang{code:"cy", name:"Welsh"},
    Lang{code:"fy", name:"Western Frisian"},
    Lang{code:"wo", name:"Wolof"},
    Lang{code:"xh", name:"Xhosa"},
    Lang{code:"yi", name:"Yiddish"},
    Lang{code:"yo", name:"Yoruba"},
    Lang{code:"zu", name:"Zulu"}
];

pub const SUBTITLE_LIST: &[ &'static str] = &[
    "srt", "vtt"
];


#[allow(dead_code)]
#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub struct Subtitle {
    path: String,
    filename: String,
    lang: Option<String>,
    lang_nm: Option<String>,
    ext: String,
}

pub fn get_all_subtitle(movie_filepath: &str) -> Vec<Subtitle> {
    let mut p = PathBuf::from(movie_filepath);
    p.set_extension("");
    let p_str = p.to_string_lossy().to_string();
    let mut files: Vec<Subtitle> = Vec::new();
    for ext in SUBTITLE_LIST {
        let path_buf = PathBuf::from(format!("{}{}", p_str, format!(".{}", ext)));
        let path = path_buf.to_string_lossy().to_string();
        let filename = path_buf.file_name().unwrap().to_string_lossy().to_string();
        files.push(Subtitle {
            path,
            filename,
            lang: None,
            lang_nm: None,
            ext: ext.to_string(),
        });
        for lang in LANG_LIST {
            let path_buf = PathBuf::from(format!("{}{}", p_str, format!(".{}.{}", lang.code, ext)));
            let path = path_buf.to_string_lossy().to_string();
            let filename = path_buf.file_name().unwrap().to_string_lossy().to_string();
            files.push(Subtitle {
                path,
                filename,
                lang: Some(lang.code.to_string()),
                lang_nm: Some(lang.name.to_string()),
                ext: ext.to_string(),
            });
        }
    }
    files
}

pub fn get_subtitle_list(movie_filepath: String) -> ApiResult<Vec<Subtitle>> {
    let all_subtitles = get_all_subtitle(&movie_filepath);
    let mut p = PathBuf::from(movie_filepath);
    p.set_extension("");
    let base_path = p.to_string_lossy().to_string();
    let pattern = Pattern::escape(&base_path) +  "*";

    let mut files: Vec<Subtitle> = Vec::new();
    for entry in glob(&pattern)? {
        let Ok(path_buf) = entry else { continue };
        let Some(filename_os) = path_buf.file_name() else { continue };
        let filename = filename_os.to_string_lossy().to_string();
        if filename.len() > base_path.len() + 12 {
            continue;
        }
        if let Some(subtitle) = all_subtitles.iter().find(|subtitle| subtitle.filename == filename){
            files.push(subtitle.clone());
        }
    }
    Ok(files)
}


pub fn srt_to_vtt(srt_path: String) -> ApiResult<String> {
    let content = std::fs::read_to_string(srt_path)?;

    let mut vtt_content = String::from("WEBVTT\n\n");

    for line in content.lines() {
        if line.contains("-->") {
            let converted = line.replace(',', ".");
            vtt_content.push_str(&converted);
            vtt_content.push('\n');
        }
        else if line.trim().parse::<u32>().is_ok() {
            continue;
        }
        else {
            vtt_content.push_str(line);
            vtt_content.push('\n');
        }
    }

    Ok(vtt_content)
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, JsonSchema, Clone, Debug)]
pub struct RepeatItem {
    id: String,
    start: f64,
    end: f64,
    desc: Option<String>
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, JsonSchema, Clone, Debug)]
pub struct RepeatJson {
    items: Vec<RepeatItem>
}


pub fn read_repeat_json(json_path: String) -> ApiResult<RepeatJson> {
    let json_str = std::fs::read_to_string(json_path)?;
    let json: RepeatJson = serde_json::from_str(&json_str)?;
    Ok(json)
}

pub fn write_repeat_json(json_path: String, json: RepeatJson) -> ApiResult<()> {
    let json_str = serde_json::to_string_pretty(&json)?;
    std::fs::write(json_path, json_str)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_subtitles_list() {
        let p = "C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4";
        get_all_subtitle(p);
    }

    #[test]
    fn test_get_subtitle_list() {
        let p = "C:\\Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4";
        let x = get_subtitle_list(p.to_string());
        println!("{:?}", x);
    }
}